import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { Pagination } from "@/components/ui/pagination";
import type { MainNavItem } from "@/lib/navigation";
import { useTranslations } from "next-intl";

type RoutePlaceholderProps = {
  activeKey?: MainNavItem["key"];
  actions?: {
    href: string;
    label: string;
    tone?: "primary" | "ghost";
  }[];
  eyebrow: string;
  title: string;
  description: string;
  variant?: "list" | "detail" | "editor" | "explore" | "graph" | "reader";
};

export type MockupCard = {
  description: string;
  href: string;
  label: string;
  meta: string;
  tags: string[];
  title: string;
};

const panelClass =
  "min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl";
const cardClass =
  "grid min-h-[220px] w-[360px] min-w-[360px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl max-[516px]:w-[82vw] max-[516px]:min-w-[82vw]";
const cardRowClass = "flex items-center justify-between gap-4";
const sortButtonClass =
  "inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-4 font-black text-white/75";
const sortButtonActiveClass =
  "border-[#E100FF]/60 bg-[#E100FF]/20 text-white";
const fieldControlClass =
  "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70";
const exploreCardClass =
  "grid min-h-[220px] min-w-0 gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl";

export const sampleCards: MockupCard[] = [
  {
    title: "달빛 항구 연대기",
    label: "World",
    description: "항구 도시와 감시단을 중심으로 움직이는 공동 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 12.4k",
    tags: ["공개", "판타지"],
  },
  {
    title: "아린 레이븐",
    label: "Character",
    description: "항구 감시단 소속의 추적자. 관계 그래프에서 중심 노드로 표시됩니다.",
    href: "/characters/demo-character",
    meta: "조회 8.1k",
    tags: ["감시단", "주연"],
  },
  {
    title: "검은 등대의 밤",
    label: "Work",
    description: "세계관 캐릭터와 소속을 연결한 챕터형 소설 초안입니다.",
    href: "/works/demo-work",
    meta: "조회 5.9k",
    tags: ["소설", "3화"],
  },
];

export const worldCards: MockupCard[] = [
  {
    title: "달빛 항구 연대기",
    label: "World",
    description: "항구 도시와 감시단을 중심으로 움직이는 공동 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 12.4k",
    tags: ["공개", "판타지"],
  },
  {
    title: "별무리 학원 기록부",
    label: "World",
    description: "초능력 학생회와 비밀 동아리 설정을 함께 쌓아가는 학원 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 8.1k",
    tags: ["학원", "능력자"],
  },
  {
    title: "붉은 사막의 계승자",
    label: "World",
    description: "가문과 진영 갈등을 중심으로 캐릭터 관계가 확장되는 사막 판타지입니다.",
    href: "/worlds/demo-world",
    meta: "조회 6.4k",
    tags: ["정치 판타지", "가문"],
  },
];

export const characterCards: MockupCard[] = [
  {
    title: "아린 레이븐",
    label: "Character",
    description: "항구 감시단 소속의 추적자. 관계 그래프에서 중심 노드로 표시됩니다.",
    href: "/characters/demo-character",
    meta: "조회 8.2k",
    tags: ["감시단", "주연"],
  },
  {
    title: "카엘 문",
    label: "Character",
    description: "검은 등대와 과거 감시단 사이에 걸쳐 있는 복합 관계 캐릭터입니다.",
    href: "/characters/demo-character",
    meta: "조회 4.9k",
    tags: ["라이벌", "비밀"],
  },
  {
    title: "세라 바인",
    label: "Character",
    description: "밀수 연합의 협상가. 여러 소속 사이에서 균형을 흔드는 인물입니다.",
    href: "/characters/demo-character",
    meta: "조회 2.7k",
    tags: ["협상가", "밀수연합"],
  },
];

export const affiliationCards: MockupCard[] = [
  {
    title: "항구 감시단",
    label: "조직",
    description: "항구 치안과 등대 사건 수사를 맡는 세계관의 중심 조직입니다.",
    href: "/affiliations/demo-affiliation",
    meta: "멤버 6명",
    tags: ["대표 소속", "공식"],
  },
  {
    title: "검은 등대",
    label: "세력",
    description: "오래된 항구 전설과 비밀 거래를 둘러싼 미확인 세력입니다.",
    href: "/affiliations/demo-affiliation",
    meta: "멤버 3명",
    tags: ["비밀", "갈등"],
  },
  {
    title: "밀수 연합",
    label: "진영",
    description: "항구의 뒷골목과 외곽 창고를 거점으로 움직이는 느슨한 연합입니다.",
    href: "/affiliations/demo-affiliation",
    meta: "멤버 5명",
    tags: ["거래", "대립"],
  },
];

export const workCards: MockupCard[] = [
  {
    title: "검은 등대의 밤",
    label: "Novel",
    description: "항구 감시단과 밀수 조직 사이의 첫 충돌을 다루는 챕터형 소설입니다.",
    href: "/works/demo-work",
    meta: "조회 8.4k",
    tags: ["소설", "3화"],
  },
  {
    title: "새벽 회의록",
    label: "Roleplay",
    description: "세계관 공동 창작자가 이어 쓴 회의형 설정놀이 로그입니다.",
    href: "/works/demo-work",
    meta: "조회 5.9k",
    tags: ["설정놀이", "공동"],
  },
  {
    title: "감시단 내부 규정",
    label: "Note",
    description: "소속 중심 설정을 문서형 창작물로 정리한 공개 설정 노트입니다.",
    href: "/works/demo-work",
    meta: "조회 3.4k",
    tags: ["설정노트", "소속"],
  },
];

const exploreWorldCards: MockupCard[] = [
  ...worldCards,
  {
    title: "유리 숲 왕국",
    label: "World",
    description: "숲의 의회와 잊힌 왕가가 대립하는 동화풍 판타지 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 7.4k",
    tags: ["#왕국", "#의회", "#마법"],
  },
  {
    title: "청색 궤도 도시",
    label: "World",
    description: "우주 정거장과 기업 도시가 맞물린 근미래 SF 설정입니다.",
    href: "/worlds/demo-world",
    meta: "조회 6.9k",
    tags: ["#SF", "#기업", "#도시"],
  },
  {
    title: "은빛 수도원",
    label: "World",
    description: "성직자, 기사단, 금서 보관소가 얽힌 고딕 미스터리 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 6.1k",
    tags: ["#고딕", "#기사단", "#금서"],
  },
  {
    title: "해무 열차 노선도",
    label: "World",
    description: "안개 바다 위를 달리는 열차와 역마다 다른 세력의 이야기를 다룹니다.",
    href: "/worlds/demo-world",
    meta: "조회 5.8k",
    tags: ["#여행", "#열차", "#군상극"],
  },
  {
    title: "검은 정원 협약",
    label: "World",
    description: "비밀 결사와 귀족 가문이 계약으로 세계를 나누는 어두운 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 5.2k",
    tags: ["#귀족", "#계약", "#비밀결사"],
  },
  {
    title: "여름섬 기록",
    label: "World",
    description: "섬 공동체, 오래된 축제, 사라진 신화를 중심으로 전개됩니다.",
    href: "/worlds/demo-world",
    meta: "조회 4.9k",
    tags: ["#섬", "#축제", "#신화"],
  },
  {
    title: "백야의 국경",
    label: "World",
    description: "끝나지 않는 낮의 땅에서 벌어지는 국경 분쟁과 망명자 이야기입니다.",
    href: "/worlds/demo-world",
    meta: "조회 4.4k",
    tags: ["#국경", "#전쟁", "#망명"],
  },
  {
    title: "심야 방송국",
    label: "World",
    description: "밤마다 다른 세계의 사연을 송출하는 도시 괴담 기반 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 4.0k",
    tags: ["#괴담", "#도시", "#방송국"],
  },
  {
    title: "낡은 별지도",
    label: "World",
    description: "별자리 항로와 탐험 길드가 사라진 문명을 찾아가는 모험 세계관입니다.",
    href: "/worlds/demo-world",
    meta: "조회 3.7k",
    tags: ["#탐험", "#길드", "#문명"],
  },
  {
    title: "녹슨 왕관",
    label: "World",
    description: "무너진 왕조의 후계자들이 각자의 소속을 등에 업고 경쟁합니다.",
    href: "/worlds/demo-world",
    meta: "조회 3.2k",
    tags: ["#왕조", "#후계자", "#정치극"],
  },
  {
    title: "새벽 시장의 약속",
    label: "World",
    description: "상인 조합과 정보상이 모이는 시장을 중심으로 관계가 확장됩니다.",
    href: "/worlds/demo-world",
    meta: "조회 2.9k",
    tags: ["#상인", "#시장", "#정보상"],
  },
  {
    title: "비취 서고",
    label: "World",
    description: "기억을 책으로 보관하는 서고와 기록관들의 규칙을 다룹니다.",
    href: "/worlds/demo-world",
    meta: "조회 2.5k",
    tags: ["#서고", "#기록관", "#기억"],
  },
];

const exploreCharacterCards: MockupCard[] = [
  ...characterCards,
  {
    title: "리온 글라스",
    label: "Character",
    description: "유리 숲 왕국의 기록관. 사라진 왕가의 문장을 해독합니다.",
    href: "/characters/demo-character",
    meta: "조회 3.9k",
    tags: ["#기록관", "#왕국", "#비밀"],
  },
  {
    title: "노아 벡터",
    label: "Character",
    description: "궤도 도시의 시스템 엔지니어. 기업 보안팀과 불안한 협력 관계입니다.",
    href: "/characters/demo-character",
    meta: "조회 3.6k",
    tags: ["#엔지니어", "#SF", "#기업"],
  },
  {
    title: "엘린 로웰",
    label: "Character",
    description: "은빛 수도원의 견습 기사. 금서 보관소 사건에 휘말립니다.",
    href: "/characters/demo-character",
    meta: "조회 3.4k",
    tags: ["#기사", "#수도원", "#금서"],
  },
  {
    title: "마레 루트",
    label: "Character",
    description: "해무 열차의 차장. 승객들의 소속과 목적지를 모두 기억합니다.",
    href: "/characters/demo-character",
    meta: "조회 3.1k",
    tags: ["#차장", "#열차", "#여행"],
  },
  {
    title: "이사벨 녹스",
    label: "Character",
    description: "검은 정원의 계약 관리자. 귀족들의 서약을 감시합니다.",
    href: "/characters/demo-character",
    meta: "조회 2.9k",
    tags: ["#계약자", "#귀족", "#비밀결사"],
  },
  {
    title: "하루 솔",
    label: "Character",
    description: "여름섬 축제의 진행자. 오래된 신화의 노래를 알고 있습니다.",
    href: "/characters/demo-character",
    meta: "조회 2.7k",
    tags: ["#축제", "#섬", "#노래"],
  },
  {
    title: "카린 노스",
    label: "Character",
    description: "백야의 국경을 넘나드는 안내자. 망명자들의 길을 엽니다.",
    href: "/characters/demo-character",
    meta: "조회 2.5k",
    tags: ["#안내자", "#국경", "#망명"],
  },
  {
    title: "윤 라디오",
    label: "Character",
    description: "심야 방송국의 DJ. 사연을 고르는 기준을 누구에게도 말하지 않습니다.",
    href: "/characters/demo-character",
    meta: "조회 2.3k",
    tags: ["#DJ", "#괴담", "#방송국"],
  },
  {
    title: "미카 스텔라",
    label: "Character",
    description: "낡은 별지도를 복원하는 탐험 길드의 항법사입니다.",
    href: "/characters/demo-character",
    meta: "조회 2.0k",
    tags: ["#항법사", "#탐험", "#별지도"],
  },
  {
    title: "테오 레인",
    label: "Character",
    description: "녹슨 왕관의 방계 후계자. 자신의 가문과 거리를 두려 합니다.",
    href: "/characters/demo-character",
    meta: "조회 1.8k",
    tags: ["#후계자", "#가문", "#왕조"],
  },
  {
    title: "사샤 코인",
    label: "Character",
    description: "새벽 시장의 정보상. 거래보다 소문을 더 비싸게 팝니다.",
    href: "/characters/demo-character",
    meta: "조회 1.6k",
    tags: ["#정보상", "#시장", "#상인"],
  },
  {
    title: "라임 페이지",
    label: "Character",
    description: "비취 서고의 보조 기록관. 다른 사람의 기억을 읽는 일을 두려워합니다.",
    href: "/characters/demo-character",
    meta: "조회 1.4k",
    tags: ["#기억", "#서고", "#기록관"],
  },
];

const exploreWorkCards: MockupCard[] = [
  ...workCards,
  {
    title: "유리 숲의 편지",
    label: "Novel",
    description: "숲의 왕가가 남긴 편지를 따라 진영의 비밀을 추적합니다.",
    href: "/works/demo-work",
    meta: "조회 6.8k",
    tags: ["#소설", "#왕가", "#비밀"],
  },
  {
    title: "궤도 도시 야근일지",
    label: "Roleplay",
    description: "기업 보안팀과 기술자들이 이어 쓰는 대화형 설정놀이입니다.",
    href: "/works/demo-work",
    meta: "조회 6.2k",
    tags: ["#SF", "#기업", "#로그"],
  },
  {
    title: "은빛 규율",
    label: "Note",
    description: "수도원 기사단의 계급, 금기, 의식 절차를 정리한 설정 노트입니다.",
    href: "/works/demo-work",
    meta: "조회 5.7k",
    tags: ["#기사단", "#규율", "#소속"],
  },
  {
    title: "해무역 플랫폼",
    label: "Novel",
    description: "열차가 멈춘 밤, 서로 다른 소속의 인물들이 한 역에 모입니다.",
    href: "/works/demo-work",
    meta: "조회 5.1k",
    tags: ["#열차", "#군상극", "#역"],
  },
  {
    title: "검은 정원의 계약서",
    label: "Note",
    description: "비밀 결사가 사용하는 계약 조항과 대가의 규칙을 정리합니다.",
    href: "/works/demo-work",
    meta: "조회 4.8k",
    tags: ["#계약", "#비밀결사", "#규칙"],
  },
  {
    title: "여름섬 축제 전야",
    label: "Roleplay",
    description: "축제를 준비하는 주민과 외부인의 짧은 장면들을 묶은 로그입니다.",
    href: "/works/demo-work",
    meta: "조회 4.4k",
    tags: ["#축제", "#섬", "#일상"],
  },
  {
    title: "백야 국경 보고서",
    label: "Note",
    description: "망명 루트, 감시 초소, 국경 도시 정보를 정리한 공개 자료입니다.",
    href: "/works/demo-work",
    meta: "조회 4.0k",
    tags: ["#국경", "#망명", "#자료"],
  },
  {
    title: "심야 주파수",
    label: "Novel",
    description: "방송국에 도착한 첫 번째 사연이 도시의 금기를 건드립니다.",
    href: "/works/demo-work",
    meta: "조회 3.8k",
    tags: ["#괴담", "#방송", "#미스터리"],
  },
  {
    title: "별지도 파편",
    label: "Novel",
    description: "탐험 길드의 신입들이 잃어버린 항로를 복원하는 에피소드입니다.",
    href: "/works/demo-work",
    meta: "조회 3.5k",
    tags: ["#탐험", "#길드", "#항로"],
  },
  {
    title: "녹슨 왕관의 증인",
    label: "Roleplay",
    description: "왕위 계승 회의에서 각 가문의 대표가 진술을 이어갑니다.",
    href: "/works/demo-work",
    meta: "조회 3.1k",
    tags: ["#왕조", "#가문", "#회의"],
  },
  {
    title: "새벽 시장 거래 장부",
    label: "Note",
    description: "시장 상인 조합의 거래 품목과 암호를 정리한 설정 노트입니다.",
    href: "/works/demo-work",
    meta: "조회 2.7k",
    tags: ["#상인", "#시장", "#암호"],
  },
  {
    title: "비취 서고 열람 규칙",
    label: "Note",
    description: "기억 서적의 열람 조건과 기록관의 금지 사항을 정리합니다.",
    href: "/works/demo-work",
    meta: "조회 2.3k",
    tags: ["#서고", "#기억", "#규칙"],
  },
];

function MiniText({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-white/20 px-2.5 text-[13px] font-black whitespace-nowrap text-white/70">
      {children}
    </span>
  );
}

function HotChip({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-[#E100FF]/60 bg-[#E100FF]/15 px-2.5 text-[13px] font-black whitespace-nowrap text-white">
      {children}
    </span>
  );
}

export function CardList({ cards = sampleCards }: { cards?: MockupCard[] }) {
  return (
    <div className="-mx-0.5 flex max-w-full min-w-0 gap-[18px] overflow-x-auto px-0.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cards.map((card, index) => (
        <a className={cardClass} href={card.href} key={`${card.title}-${index}`}>
          <div className={cardRowClass}>
            {index === 0 ? <HotChip>{card.label}</HotChip> : <MiniText>{card.label}</MiniText>}
            <MiniText>{card.meta}</MiniText>
          </div>
          <h3 className="text-xl leading-tight font-black">{card.title}</h3>
          <p className="text-white/65">{card.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {card.tags.map((tag) => (
              <MiniText key={tag}>{tag}</MiniText>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}

export function ResourceSection({
  cards,
  createHref,
  title,
  viewHref,
}: {
  cards: MockupCard[];
  createHref?: string;
  title: string;
  viewHref?: string;
}) {
  const t = useTranslations("placeholder");
  return (
    <article className={panelClass}>
      <div className="mb-5 flex items-center justify-between gap-4 max-md:items-start max-md:flex-col">
        <h2 className="text-[28px] leading-tight font-black">{title}</h2>
        {viewHref || createHref ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5 max-md:justify-start">
            {viewHref ? (
              <a className={`${sortButtonClass} ${sortButtonActiveClass}`} href={viewHref}>
                {t("view", { title })}
              </a>
            ) : null}
            {createHref ? (
              <a className={sortButtonClass} href={createHref}>
                {t("create", { title })}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <CardList cards={cards} />
    </article>
  );
}

function selectCards(title: string) {
  if (title.includes("캐릭터") || title.includes("자캐") || title.includes("Character")) return characterCards;
  if (title.includes("소속") || title.includes("Affiliation")) return affiliationCards;
  if (title.includes("창작물") || title.includes("Work")) return workCards;
  return worldCards;
}

function ExploreCardGrid({ cards }: { cards: MockupCard[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 [@media(max-width:768px)]:grid-cols-1">
      {cards.slice(0, 15).map((card, index) => (
        <a className={exploreCardClass} href={card.href} key={`${card.title}-${index}`}>
          <div className={cardRowClass}>
            {index === 0 ? <HotChip>{card.label}</HotChip> : <MiniText>{card.label}</MiniText>}
            <span className="text-[13px] font-semibold text-white/65">{card.meta}</span>
          </div>
          <h3 className="text-xl leading-tight font-black">{card.title}</h3>
          <p className="text-white/65">{card.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {card.tags.map((tag) => (
              <MiniText key={tag}>{tag.startsWith("#") ? tag : `#${tag}`}</MiniText>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}

function PlaceholderBody({
  title,
  variant,
}: {
  title: string;
  variant: RoutePlaceholderProps["variant"];
}) {
  const common = useTranslations("common");
  const placeholder = useTranslations("placeholder");
  const characterExplore = useTranslations("explore.characters");
  const workExplore = useTranslations("explore.works");
  const worldExplore = useTranslations("explore.worlds");
  const worldDetail = useTranslations("worlds.detail");

  if (variant === "editor") {
    return (
      <article className={panelClass}>
        <form className="grid gap-[18px]">
          <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
            <label className="grid gap-2 font-black text-white/90">
              <span>{placeholder("name")}</span>
              <input className={fieldControlClass} placeholder={title.replace(" 수정", "").replace(" 제작", "")} />
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{placeholder("visibility")}</span>
              <select className={fieldControlClass} defaultValue="PRIVATE">
                <option>PRIVATE</option>
                <option>SHARED</option>
                <option>PUBLIC</option>
              </select>
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{placeholder("imageUrl")}</span>
              <input className={fieldControlClass} placeholder="https://example.com/image.png" />
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{placeholder("tags")}</span>
              <input className={fieldControlClass} placeholder="#추적자 #감시단 #주연" />
            </label>
          </div>
          <label className="grid gap-2 font-black text-white/90">
            <span>{placeholder("introduction")}</span>
            <textarea
              className="min-h-[180px] w-full resize-y rounded-lg border border-white/15 bg-black/50 p-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
              placeholder={placeholder("markdownPlaceholder")}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{placeholder("markdownTitle")}</Chip>
            <Chip>{placeholder("markdownSubtitle")}</Chip>
            <Chip>{placeholder("markdownList")}</Chip>
            <Chip>{placeholder("markdownKeyword")}</Chip>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <ButtonLink href="#" tone="ghost">
              {common("cancel")}
            </ButtonLink>
            <ButtonLink href="#" tone="primary">
              {common("save")}
            </ButtonLink>
          </div>
        </form>
      </article>
    );
  }

  if (variant === "explore") {
    const explore = title.includes("캐릭터") || title.includes("Character")
      ? {
          cards: exploreCharacterCards,
          heading: characterExplore("results"),
          hint: characterExplore("resultDescription"),
          lastPage: 26,
          placeholder: characterExplore("placeholder"),
        }
      : title.includes("창작물") || title.includes("Work")
        ? {
            cards: exploreWorkCards,
            heading: workExplore("results"),
            hint: workExplore("resultDescription"),
            lastPage: 17,
            placeholder: workExplore("placeholder"),
          }
        : {
            cards: exploreWorldCards,
            heading: worldExplore("results"),
            hint: worldExplore("resultDescription"),
            lastPage: 9,
            placeholder: worldExplore("placeholder"),
          };

    return (
      <>
        <section className={panelClass} aria-label={placeholder("criteria", { title })}>
          <form className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] gap-2.5">
            <label className="grid min-w-0 gap-2 font-black text-white/85">
              <span>{common("searchKeywordOrTag")}</span>
              <input className={fieldControlClass} placeholder={explore.placeholder} type="search" />
            </label>
            <ButtonLink className="self-end" href="#" tone="ghost">
              {common("reset")}
            </ButtonLink>
            <ButtonLink className="self-end" href="#" tone="primary">
              {common("search")}
            </ButtonLink>
          </form>
        </section>
        <section className="grid gap-4">
          <article className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4 [@media(max-width:512px)]:items-start [@media(max-width:512px)]:flex-col">
              <div className="grid gap-1">
                <h2 className="text-[28px] leading-tight font-black">{explore.heading}</h2>
                <p className="text-[13px] text-white/65">{explore.hint}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 [@media(max-width:512px)]:justify-start">
                <a className={`${sortButtonClass} ${sortButtonActiveClass} min-h-[30px] px-3 text-[13px]`} href="#">
                  {common("popular")}
                </a>
                <a className={`${sortButtonClass} min-h-[30px] px-3 text-[13px]`} href="#">
                  {common("latest")}
                </a>
              </div>
            </div>
            <ExploreCardGrid cards={explore.cards} />
            <div className="mt-[18px] border-t border-white/10 pt-4">
              <Pagination lastPage={explore.lastPage} />
            </div>
          </article>
        </section>
      </>
    );
  }

  if (variant === "graph") {
    return (
      <article className={`${panelClass} relative min-h-[420px] overflow-hidden`}>
        <div className="absolute top-[118px] left-[90px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
          아린
        </div>
        <div className="absolute top-[52px] left-[430px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
          카엘
        </div>
        <div className="absolute right-[120px] bottom-[112px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
          노아
        </div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 360" aria-hidden="true">
          <line x1="160" y1="150" x2="450" y2="84" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
          <line x1="450" y1="84" x2="690" y2="230" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
          <line x1="160" y1="150" x2="690" y2="230" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
        </svg>
      </article>
    );
  }

  if (variant === "reader" || variant === "detail") {
    return (
      <section className="grid gap-6">
        <article className={panelClass}>
          <h2 className="mb-5 text-[28px] leading-tight font-black">
            {variant === "reader" ? "Chapter 1" : placeholder("introduction")}
          </h2>
          <MarkdownViewer>
            {"# 달빛 항구 연대기\n\n항구 도시의 감시단, 밀수 조직, 등대 전설이 얽힌 세계관입니다.\n\n## 핵심 배경\n\n달빛 항구는 밤마다 다른 바다와 이어집니다."}
          </MarkdownViewer>
        </article>
        {variant === "detail" ? (
          <>
            <ResourceSection cards={characterCards} title={worldDetail("characters")} viewHref="/characters" />
            <ResourceSection cards={affiliationCards} title={worldDetail("affiliations")} viewHref="/affiliations" />
            <ResourceSection cards={workCards} title={worldDetail("works")} viewHref="/works" />
            <article className={`${panelClass} relative min-h-[420px] overflow-hidden`}>
              <div className="relative z-10 flex items-center justify-between gap-4">
                <h2 className="text-[28px] leading-tight font-black">{worldDetail("relations")}</h2>
                <ButtonLink href="/relations" tone="primary">
                  {worldDetail("viewGraph")}
                </ButtonLink>
              </div>
              <div className="absolute top-[150px] left-[90px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
                아린
              </div>
              <div className="absolute top-[96px] left-[430px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
                카엘
              </div>
              <div className="absolute right-[120px] bottom-[112px] z-10 grid h-[76px] w-[132px] place-items-center rounded-lg border border-white/15 bg-black/80 text-xl font-black">
                노아
              </div>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 360" aria-hidden="true">
                <line x1="160" y1="176" x2="450" y2="122" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
                <line x1="450" y1="122" x2="690" y2="230" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
                <line x1="160" y1="176" x2="690" y2="230" stroke="rgba(225,0,255,0.5)" strokeWidth="3" />
              </svg>
            </article>
          </>
        ) : null}
      </section>
    );
  }

  return (
    <article className={panelClass}>
      <div className="mb-5 flex items-center justify-between gap-4 max-md:items-start max-md:flex-col">
        <h2 className="text-[28px] leading-tight font-black">{title}</h2>
        <div className="flex flex-wrap items-center justify-end gap-2.5 max-md:justify-start">
          <a className={`${sortButtonClass} ${sortButtonActiveClass}`} href="#">
            {common("manage")}
          </a>
          <a
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black whitespace-nowrap text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)]"
            href="#"
          >
            {placeholder("selectedDelete")}
          </a>
        </div>
      </div>
      <CardList cards={selectCards(title)} />
    </article>
  );
}

export function RoutePlaceholder({
  actions = [],
  description,
  eyebrow,
  title,
  variant = "list",
}: RoutePlaceholderProps) {
  return (
    <>
      <section className="flex min-h-[220px] items-center justify-between gap-[18px] border-b border-white/15 pb-7 max-md:items-start max-md:flex-col">
        <div className="grid max-w-[720px] gap-3.5">
          <p className="inline-flex w-fit rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black tracking-normal text-white/80 uppercase">
            {eyebrow}
          </p>
          <h1 className="text-4xl leading-tight font-black max-[516px]:text-[32px]">{title}</h1>
          <p className="text-white/65">{description}</p>
        </div>
        {actions.length ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5 max-md:w-full max-md:justify-start">
            {actions.map((action) => (
              <ButtonLink
                className="max-md:flex-1"
                key={action.href}
                href={action.href}
                tone={action.tone ?? "ghost"}
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        ) : null}
      </section>
      <PlaceholderBody title={title} variant={variant} />
    </>
  );
}
