// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 환경변수로 설정해 두신 URL/KEY 를 사용해 단 한 번만 클라이언트를 초기화합니다.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;
