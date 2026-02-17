import { QuickCheckItem, MainCheckItem, DomainConfig } from './types';

export const QUICK_CHECK_ITEMS: QuickCheckItem[] = [
  { id: 'Q1', text: '最近1か月、よく眠れないことが増えた', tags: ['symptom'] },
  { id: 'Q2', text: '最近1か月、ひどく疲れた/へとへとが続く', tags: ['symptom'] },
  { id: 'Q3', text: '最近1か月、不安・落ち着かなさが増えた', tags: ['symptom'] },
  { id: 'Q4', text: '最近1か月、ゆううつ/何をするのも面倒が増えた', tags: ['symptom'] },
  { id: 'Q5', text: '仕事量や期限が現実的でなく、いつも追われている', tags: ['Demands'] },
  { id: 'Q6', text: '自分で進め方やペースを決めにくく、裁量が少ない', tags: ['Control'] },
  { id: 'Q7', text: '上司や同僚に困りごとを相談しづらい', tags: ['Support'] },
  { id: 'Q8', text: '職場の人間関係で摩擦・攻撃・ハラスメントを感じる', tags: ['Relationships'] },
];

export const MAIN_CHECK_DOMAINS: DomainConfig[] = [
  { key: 'Demands', label_ja: '仕事量・締切', reverse: false },
  { key: 'Control', label_ja: '裁量（自分で決められなさ）', reverse: true },
  { key: 'Support', label_ja: '助けの得やすさ', reverse: true },
  { key: 'Relationships', label_ja: '人間関係ストレス', reverse: false },
  { key: 'Role', label_ja: '役割のあいまいさ', reverse: true },
  { key: 'Change', label_ja: '変更ストレス', reverse: true },
  { key: 'Symptoms', label_ja: '心身の消耗', reverse: false },
];

export const MAIN_CHECK_ITEMS: MainCheckItem[] = [
  // Demands
  { id: 'D1', domain: 'Demands', reverse: false, text: '期限や量が現実的でなく、達成が難しい締切がある' },
  { id: 'D2', domain: 'Demands', reverse: false, text: '仕事が多すぎて、一部のタスクを後回し/放置せざるを得ない' },
  { id: 'D3', domain: 'Demands', reverse: false, text: '仕事を速く/集中的にこなさないと回らない' },
  // Control
  { id: 'C1', domain: 'Control', reverse: true, text: '休憩を取るタイミングを自分で決められる' },
  { id: 'C2', domain: 'Control', reverse: true, text: '仕事の進め方（手順）をある程度自分で選べる' },
  { id: 'C3', domain: 'Control', reverse: true, text: '自分の仕事ペースに意見が反映される' },
  // Support
  { id: 'S1', domain: 'Support', reverse: true, text: '困った時、上司や周囲が仕事上の問題を助けてくれる' },
  { id: 'S2', domain: 'Support', reverse: true, text: '仕事で嫌だった/腹が立ったことを相談できる相手がいる' },
  { id: 'S3', domain: 'Support', reverse: true, text: '日頃、励ましや後押しが得られる' },
  { id: 'S4', domain: 'Support', reverse: true, text: '仕事が難しい時、同僚が手を貸してくれる' },
  { id: 'S5', domain: 'Support', reverse: true, text: '仕事面で必要な支援が得られる' },
  { id: 'S6', domain: 'Support', reverse: true, text: '話を聞く姿勢のある人がいる' },
  // Relationships
  { id: 'R1', domain: 'Relationships', reverse: false, text: '同僚間に怒り・摩擦がある' },
  { id: 'R2', domain: 'Relationships', reverse: false, text: 'いじめ/威圧/ハラスメントを受けていると感じる' },
  { id: 'R3', domain: 'Relationships', reverse: false, text: '職場の関係が張りつめている/ギスギスしている' },
  // Role
  { id: 'RO1', domain: 'Role', reverse: true, text: '仕事で期待されていることが明確だ' },
  { id: 'RO2', domain: 'Role', reverse: true, text: '自分の職務・責任範囲が明確だ' },
  { id: 'RO3', domain: 'Role', reverse: true, text: '自分の仕事が組織全体の目的にどうつながるか分かる' },
  // Change
  { id: 'CH1', domain: 'Change', reverse: true, text: '変更がある時、内容が事前に共有される' },
  { id: 'CH2', domain: 'Change', reverse: true, text: '変更がある時、現場でどう運用されるか見通しがある' },
  { id: 'CH3', domain: 'Change', reverse: true, text: '変更について質問/意見を言える機会がある' },
  // Symptoms
  { id: 'ST1', domain: 'Symptoms', reverse: false, text: '最近1か月、ひどく疲れた/へとへとが続く' },
  { id: 'ST2', domain: 'Symptoms', reverse: false, text: '最近1か月、だるいと感じることが多い' },
  { id: 'ST3', domain: 'Symptoms', reverse: false, text: '最近1か月、イライラが増えた' },
  { id: 'ST4', domain: 'Symptoms', reverse: false, text: '最近1か月、不安/落ち着かないが増えた' },
  { id: 'ST5', domain: 'Symptoms', reverse: false, text: '最近1か月、集中できないが増えた' },
  { id: 'ST6', domain: 'Symptoms', reverse: false, text: '最近1か月、よく眠れないが増えた' },
];

export const SCALE_LABELS = {
  1: "まったく当てはまらない",
  2: "あまり当てはまらない",
  3: "どちらともいえない",
  4: "やや当てはまる",
  5: "とても当てはまる"
};

export const CTA_URL = "https://upsetform1.vercel.app/";
