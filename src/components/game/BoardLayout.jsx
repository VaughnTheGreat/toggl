import React from 'react';
import { ChevronDown } from 'lucide-react';

// Arranges switches to match the level's shape (hub on top, islands as clusters,
// mirror halves split by a seam, pipelines as a flowing column).
const byId = (buttons, ids) => ids.map((id) => buttons.find((b) => b.id === id)).filter(Boolean);
const Label = ({ children }) => (
  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 px-1">{children}</div>
);

function Grid({ list, total, renderRow }) {
  const cls = total >= 10 ? 'grid grid-cols-3 md:grid-cols-4 gap-2'
    : total >= 7 ? 'grid grid-cols-2 md:grid-cols-3 gap-2'
    : 'flex flex-col gap-2';
  return <div className={cls}>{list.map((b) => renderRow(b, total >= 7))}</div>;
}

export default function BoardLayout({ buttons, layout = {}, renderRow }) {
  const { shape, groups, hub } = layout;
  const total = buttons.length;

  if (shape === 'hub' && hub) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-3xl p-1.5 bg-[#00C2A8]/10 border border-[#00C2A8]/30">
          <Label>Hub</Label>
          {byId(buttons, [hub]).map((b) => renderRow(b, false))}
        </div>
        <Grid list={buttons.filter((b) => b.id !== hub)} total={total} renderRow={renderRow} />
      </div>
    );
  }

  if (shape === 'islands' && groups) {
    const big = total >= 7;
    return (
      <div className={big ? `grid gap-2 ${groups.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}` : 'flex flex-col gap-3'}>
        {groups.map((g, i) => (
          <div key={i} className="rounded-2xl border border-dashed border-border p-1.5">
            <Label>Island {i + 1}</Label>
            <div className="flex flex-col gap-2">{byId(buttons, g).map((b) => renderRow(b, big))}</div>
          </div>
        ))}
      </div>
    );
  }

  if (shape === 'mirror' && groups) {
    const [left, right, mid] = groups;
    return (
      <div className="flex flex-col gap-2">
        <Grid list={byId(buttons, left)} total={total} renderRow={renderRow} />
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Mirror</span>
          <div className="flex-1 border-t border-dashed border-border" />
        </div>
        <Grid list={byId(buttons, right)} total={total} renderRow={renderRow} />
        {mid && <Grid list={byId(buttons, mid)} total={1} renderRow={renderRow} />}
      </div>
    );
  }

  if (shape === 'pipeline' && total < 7) {
    return (
      <div className="flex flex-col">
        {buttons.map((b, i) => (
          <React.Fragment key={b.id}>
            {i > 0 && <ChevronDown className="w-4 h-4 mx-auto text-[#B4BACA] my-0.5" />}
            {renderRow(b, false)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <Grid list={buttons} total={total} renderRow={renderRow} />;
}