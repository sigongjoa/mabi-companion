INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('epic_weapon', '에픽 무기 인장', '에픽', '무기', '공격력 +300');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('epic_necklace', '에픽 목걸이 인장', '에픽', '목걸이', '공격력 +150');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('epic_emblem', '에픽 엠블럼 인장', '에픽', '엠블럼', '공격력 +10%');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_head', '엘리트 모자 인장', '엘리트', '모자', '방어력 +100');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_top', '엘리트 상의 인장', '엘리트', '상의', '방어력 +100');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_bottom', '엘리트 하의 인장', '엘리트', '하의', '방어력 +100');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_gloves', '엘리트 장갑 인장', '엘리트', '장갑', '방어력 +100');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_shoes', '엘리트 신발 인장', '엘리트', '신발', '방어력 +100');
INSERT INTO star_seal_types (id, name, grade, slot, effect) VALUES ('elite_ring', '엘리트 반지 인장', '엘리트', '반지', '방어력 +50');
INSERT INTO star_seal_acquisition_methods (method, description) VALUES ('NPC 상점 구매', '던바튼의 에반(모험가 길드 지원 센터) 또는 티르코네일의 던컨(던킨의 모험가 지원소)에게서 ''마물 퇴치 증표'' 200개로 ''아득한 별의 인장''을 교환할 수 있습니다. 구매 후 6일 간 재입고 시간이 존재합니다.');
INSERT INTO star_seal_acquisition_methods (method, description) VALUES ('필드 보스 처치', '필드 보스 처치 시 확률적으로 ''별의 인장''을 획득할 수 있습니다. 주 1회 토벌 보상 획득 횟수 제한이 있습니다.');
INSERT INTO star_seal_acquisition_bosses (method_id, name, recommended_class, unique_equipment) VALUES ((SELECT id FROM star_seal_acquisition_methods WHERE method = '필드 보스 처치'), '페리', '전사 계열', '검과 방패, 대검, 장검');
INSERT INTO star_seal_acquisition_bosses (method_id, name, recommended_class, unique_equipment) VALUES ((SELECT id FROM star_seal_acquisition_methods WHERE method = '필드 보스 처치'), '크라브바흐', '힐러/음유시인', '힐링 완드, 힐링 스태프, 쿼터 스태프, 전투 류트, 전투 하프, 전투 부채');
INSERT INTO star_seal_acquisition_bosses (method_id, name, recommended_class, unique_equipment) VALUES ((SELECT id FROM star_seal_acquisition_methods WHERE method = '필드 보스 처치'), '크라마', '궁수/마법사', '단궁, 장궁, 석궁, 완드, 케인, 아이스오브');
INSERT INTO star_seal_acquisition_methods (method, description) VALUES ('히든 퀘스트 클리어', '히든 퀘스트 '다그다의 무덤'을 클리어하면 '방어구 별의 인장 선택 상자'를 획득할 수 있습니다. 상자에서는 모자, 상의, 하의, 장갑, 신발, 반지 중 선택 가능합니다. 바로 사용하지 말고, 장비 구성이나 인장 중복 여부에 따라 타이밍을 조절해 사용하는 것이 유리합니다.');
INSERT INTO star_seal_acquisition_methods (method, description) VALUES ('던전 공략', '알비 심층 (레벨 58 이상), 키아 심층 (레벨 62 이상), 라비 심층 (레벨 65 이상) 등 심층 던전에서 낮은 확률로 별의 인장이 드랍될 수 있습니다. 입장 조건으로 ''마족 공물''이 필요합니다.');
INSERT INTO star_seal_acquisition_methods (method, description) VALUES ('사냥터(여신의 뜰, 얼음 협곡) 검은 구멍', '특정 사냥터에서 랜덤으로 등장하는 미니 던전인 '검은 구멍'에서 획득 가능합니다. 하루 3회 입장 가능하며 매일 오전 6시 초기화됩니다. '늑대의 숲'에서는 등장하지 않습니다. 엠블럼도 획득 가능합니다. 사냥터 '지역 임무' 보상으로도 획득 가능합니다.');
INSERT INTO star_seal_black_hole_types (method_id, type, features) VALUES ((SELECT id FROM star_seal_acquisition_methods WHERE method = '사냥터(여신의 뜰, 얼음 협곡) 검은 구멍'), '지하로 뚫린 검은 구멍', '다양한 몬스터 등장 (* 별 골렘 몬스터가 있는 던전은 ''남아 있는 의문'' 퀘스트 클리어 이후 등장)');
INSERT INTO star_seal_black_hole_types (method_id, type, features) VALUES ((SELECT id FROM star_seal_acquisition_methods WHERE method = '사냥터(여신의 뜰, 얼음 협곡) 검은 구멍'), '심층으로 뚫린 검은 구멍', '강력한 보스 등장, 고난이도 전투 필요');
INSERT INTO star_seal_qa (question, answer) VALUES ('인장이 중복되면 어떻게 처리하나요?', '현재는 골드에 판매하는 것 외에는 처리 방법이 없습니다. 앞으로 인장 해체 시스템이나 교환 콘텐츠가 나올 가능성도 기대해볼 수 있습니다.');
INSERT INTO star_seal_qa (question, answer) VALUES ('인장 효과는 중첩되나요?', '동일 부위에는 하나의 인장만 적용되며, 중복 장착은 불가능합니다.');
INSERT INTO star_seal_qa (question, answer) VALUES ('무기 교체 시 인장도 사라지나요?', '아닙니다. 인장은 슬롯에 새겨지므로 장비를 바꾸어도 효과가 유지됩니다.');