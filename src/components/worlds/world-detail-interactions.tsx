"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

type Relation = {
  description: string;
  direction: string;
  from: string;
  id: string;
  name: string;
  status: string;
  to: string;
};

const relations: Relation[] = [
  {
    description: "등대 사건 이전부터 이어진 신뢰와 의심이 함께 남아 있는 관계입니다.",
    direction: "양방향",
    from: "아린",
    id: "arin-kael",
    name: "과거 인연",
    status: "ACTIVE",
    to: "카엘",
  },
  {
    description: "감시단의 수사와 밀수 연합의 거래가 충돌하며 형성된 긴장 관계입니다.",
    direction: "갈등",
    from: "아린",
    id: "arin-sera",
    name: "추적자와 협상가",
    status: "RIVALED",
    to: "세라",
  },
  {
    description: "리온은 카엘의 과거 소속과 검은 등대 문서의 빈칸을 알고 있습니다.",
    direction: "정보",
    from: "카엘",
    id: "kael-rion",
    name: "기록된 비밀",
    status: "SECRET",
    to: "리온",
  },
  {
    description: "밀수 연합의 장부와 기록관 조합의 보관 규칙이 만나는 관계입니다.",
    direction: "거래",
    from: "세라",
    id: "sera-rion",
    name: "거래 기록",
    status: "PAST",
    to: "리온",
  },
  {
    description: "노아는 감시단 내부 규정에 따라 카엘의 이동 기록을 추적합니다.",
    direction: "감시",
    from: "카엘",
    id: "kael-noa",
    name: "감시 대상",
    status: "ACTIVE",
    to: "노아",
  },
];

const nodes = [
  { affiliation: "항구 감시단", left: 120, name: "아린", top: 150 },
  { affiliation: "검은 등대", left: 520, name: "카엘", top: 210 },
  { affiliation: "밀수 연합", left: 300, name: "세라", top: 500 },
  { affiliation: "기록관 조합", left: 780, name: "리온", top: 430 },
  { affiliation: "항구 감시단", left: 900, name: "노아", top: 150 },
];

const edges = [
  { id: "arin-kael", x1: 192, x2: 592, y1: 190, y2: 250 },
  { id: "arin-sera", x1: 192, x2: 372, y1: 190, y2: 540 },
  { id: "kael-rion", x1: 592, x2: 852, y1: 250, y2: 470 },
  { id: "sera-rion", x1: 372, x2: 852, y1: 540, y2: 470 },
  { id: "kael-noa", x1: 592, x2: 972, y1: 250, y2: 190 },
];

export function WorldRelationGraph() {
  const t = useTranslations("relations");
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, left: 0, top: 0, x: 0, y: 0 });
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.scrollLeft = 70;
    canvas.scrollTop = 90;
  }, []);

  return (
    <>
      <section
        className="min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        aria-labelledby="relations-title"
      >
        <div className="mb-4 flex items-center justify-between gap-3.5 max-md:flex-col max-md:items-start">
          <h2 className="text-[28px] leading-tight font-black" id="relations-title">
            {t("graph")}
          </h2>
          <ButtonLink className="min-h-[30px] px-3 text-[13px]" href="/relations">
            {t("view")}
          </ButtonLink>
        </div>
        <div
          aria-label={t("graphAria")}
          className="relative h-[520px] w-full cursor-grab touch-none overflow-auto rounded-lg border border-white/15 bg-[radial-gradient(circle_at_28%_24%,rgba(225,0,255,0.24),transparent_22%),radial-gradient(circle_at_72%_76%,rgba(255,0,64,0.22),transparent_24%),rgba(255,255,255,0.045)] select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerCancel={(event) => {
            pointerRef.current.active = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerDown={(event) => {
            if ((event.target as Element).closest("button")) return;
            pointerRef.current = {
              active: true,
              left: event.currentTarget.scrollLeft,
              top: event.currentTarget.scrollTop,
              x: event.clientX,
              y: event.clientY,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const pointer = pointerRef.current;
            if (!pointer.active) return;
            event.preventDefault();
            event.currentTarget.scrollLeft = pointer.left - (event.clientX - pointer.x);
            event.currentTarget.scrollTop = pointer.top - (event.clientY - pointer.y);
          }}
          onPointerUp={(event) => {
            pointerRef.current.active = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          ref={canvasRef}
        >
          <div className="relative h-[760px] w-[1120px]">
            <svg aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" viewBox="0 0 1120 760">
              <defs>
                <linearGradient id="relation-edge" x1="0" x2="1">
                  <stop offset="0" stopColor="rgba(225,0,255,0.78)" />
                  <stop offset="1" stopColor="rgba(255,0,64,0.78)" />
                </linearGradient>
              </defs>
              {edges.map((edge) => (
                <line
                  className="cursor-pointer stroke-[10] stroke-transparent outline-none hover:stroke-[14] focus:stroke-[14]"
                  key={`${edge.id}-hit`}
                  onClick={() => setSelectedRelation(relations.find((relation) => relation.id === edge.id) ?? null)}
                  role="button"
                  tabIndex={0}
                  x1={edge.x1}
                  x2={edge.x2}
                  y1={edge.y1}
                  y2={edge.y2}
                />
              ))}
              {edges.map((edge) => (
                <line
                  className="pointer-events-none"
                  key={edge.id}
                  stroke="url(#relation-edge)"
                  strokeLinecap="round"
                  strokeWidth="3"
                  x1={edge.x1}
                  x2={edge.x2}
                  y1={edge.y1}
                  y2={edge.y2}
                />
              ))}
            </svg>
            {nodes.map((node) => (
              <div
                className="absolute z-10 grid min-h-20 w-36 gap-1 rounded-lg border border-white/15 bg-black/75 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
                key={node.name}
                style={{ left: node.left, top: node.top }}
              >
                <strong>{node.name}</strong>
                <span className="text-[13px] text-white/65">{node.affiliation}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedRelation ? (
        <div
          aria-labelledby="relation-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          onClick={() => setSelectedRelation(null)}
          role="dialog"
        >
          <article
            className="grid w-full max-w-[460px] gap-3.5 rounded-lg border border-white/15 bg-[#0a0a0e]/95 p-[22px] shadow-[0_28px_80px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3.5">
              <h3 className="text-xl font-black" id="relation-modal-title">
                {selectedRelation.from} ↔ {selectedRelation.to}
              </h3>
              <button
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-[18px] font-black"
                onClick={() => setSelectedRelation(null)}
                type="button"
              >
                {t("close")}
              </button>
            </div>
            <p className="text-white/65">{t("relationName", { name: selectedRelation.name })}</p>
            <p className="leading-relaxed text-white/65">{selectedRelation.description}</p>
            <div className="flex flex-wrap gap-2">
              <Chip active>{selectedRelation.status}</Chip>
              <Chip>{selectedRelation.direction}</Chip>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
