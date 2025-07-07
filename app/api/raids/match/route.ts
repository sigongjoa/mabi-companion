import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RaidPost, RaidMatch } from '@/types/raid';
import { UserProfile } from '@/types/qa';
import { AppNotification } from '@/types/notification';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const { data: requestPost, error: postError } = await supabase
      .from('raidPosts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !requestPost) {
      console.error('Error fetching post:', postError);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const requestStartTime = new Date(requestPost.startTime);
    const requestEndTime = new Date(requestPost.endTime);
    const requestPartyType = requestPost.partyType;

    const { data: offers, error: offersError } = await supabase
      .from('raidPosts')
      .select('*')
      .eq('type', 'offer')
      .eq('status', 'open')
      .eq('partyType', requestPartyType);

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const matchingOffers: RaidPost[] = [];

    offers.forEach(offerPost => {
      const offerStartTime = new Date(offerPost.startTime);
      const offerEndTime = new Date(offerPost.endTime);

      // Check for time overlap
      if (requestStartTime < offerEndTime && requestEndTime > offerStartTime) {
        matchingOffers.push(offerPost as RaidPost);
      }
    });

    return NextResponse.json(matchingOffers);

  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new match
export async function POST(request: Request) {
    const { postId, offerId } = await request.json();

    if (!postId || !offerId) {
        return NextResponse.json({ error: 'Post ID and Offer ID are required' }, { status: 400 });
    }

    try {
        // Update post statuses
        const { error: postUpdateError } = await supabase
            .from('raidPosts')
            .update({ status: 'matched' })
            .eq('id', postId);
        if (postUpdateError) throw postUpdateError;

        const { error: offerUpdateError } = await supabase
            .from('raidPosts')
            .update({ status: 'matched' })
            .eq('id', offerId);
        if (offerUpdateError) throw offerUpdateError;

        // Fetch updated post data
        const { data: postData, error: postFetchError } = await supabase
            .from('raidPosts')
            .select('authorId, description')
            .eq('id', postId)
            .single();
        if (postFetchError) throw postFetchError;

        const { data: offerData, error: offerFetchError } = await supabase
            .from('raidPosts')
            .select('authorId, description')
            .eq('id', offerId)
            .single();
        if (offerFetchError) throw offerFetchError;

        const newMatch: Omit<RaidMatch, 'id'> = {
            postId,
            participants: [postData.authorId, offerData.authorId],
            matchedTime: new Date().toISOString(), // Supabase handles createdAt automatically
            status: 'completed', // Assume completed for now, can be updated later
        };

        const { data: matchResult, error: matchInsertError } = await supabase
            .from('raidMatches')
            .insert(newMatch)
            .select('id')
            .single();
        if (matchInsertError) throw matchInsertError;

        // Notify participants
        const { data: postAuthorProfile, error: postAuthorError } = await supabase
            .from('users')
            .select('username')
            .eq('id', postData.authorId)
            .single();
        if (postAuthorError) throw postAuthorError;

        const { data: offerAuthorProfile, error: offerAuthorError } = await supabase
            .from('users')
            .select('username')
            .eq('id', offerData.authorId)
            .single();
        if (offerAuthorError) throw offerAuthorError;

        // Notification for the requestor
        await supabase
            .from('notifications')
            .insert({
                userId: postData.authorId,
                type: 'match_accepted',
                message: `${offerAuthorProfile?.username || 'Unknown User'}님이 '${postData.description}' 레이드 매칭을 수락했습니다.`,
                link: `/raid-board`,
                read: false,
                fromUserId: offerData.authorId,
            });

        // Notification for the offeror
        await supabase
            .from('notifications')
            .insert({
                userId: offerData.authorId,
                type: 'match_accepted',
                message: `${postAuthorProfile?.username || 'Unknown User'}님이 '${offerData.description}' 레이드 매칭을 수락했습니다.`,
                link: `/raid-board`,
                read: false,
                fromUserId: postData.authorId,
            });

        return NextResponse.json({ matchId: matchResult.id });

    } catch (error) {
        console.error("Error creating match:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Add feedback to a match
export async function PUT(request: Request) {
    const { matchId, rating, comment, from, to } = await request.json();

    if (!matchId || !rating || !from || !to) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const { error: matchUpdateError } = await supabase
            .from('raidMatches')
            .update({ feedback: { rating, comment, from, to } })
            .eq('id', matchId);
        if (matchUpdateError) throw matchUpdateError;

        // Update user's rating
        const { data: userData, error: userFetchError } = await supabase
            .from('users')
            .select('rating, feedbackCount')
            .eq('id', to)
            .single();
        if (userFetchError) throw userFetchError;

        const currentRating = userData?.rating || 0;
        const feedbackCount = userData?.feedbackCount || 0;
        const newRating = (currentRating * feedbackCount + rating) / (feedbackCount + 1);

        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ rating: newRating, feedbackCount: feedbackCount + 1 })
            .eq('id', to);
        if (userUpdateError) throw userUpdateError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}