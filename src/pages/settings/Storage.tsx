import { useState } from 'react';
import { Group, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

// 设置 → 储存空间 → 优化。
// 确认框与回复刻意使用和 AI 日志里一模一样的措辞:"需要二次确认。确认后将无法恢复。" → "确认。" → "已优化。"
export default function Storage() {
  const { trace, track, notify } = useGame();
  const done = trace.some((t) => t.kind === 'optimize');
  const [sheet, setSheet] = useState(false);

  const confirm = () => {
    setSheet(false);
    track('optimize', '优化存储空间 · 已确认');
    notify('已优化。');
  };

  return (
    <div>
      <Group title="iPad" footer={done ? '已释放 1.2 GB。' : '建议:优化 HomeMind 的旧缓存与日志,可释放 1.2 GB。'}>
        <Row title="已用" detail={done ? '37.0 GB / 128 GB' : '38.2 GB / 128 GB'} />
        <Row title="系统" detail="14.6 GB" />
        <Row title="HomeMind 缓存与日志" detail={done ? '0 GB' : '1.2 GB'} />
        <Row title="其他" detail="21.2 GB" />
      </Group>

      <Group>
        <Row
          title={<span className={done ? 'text-[#8e8e93]' : 'text-[#007aff]'}>{done ? '已优化' : '优化存储空间'}</span>}
          onClick={done ? undefined : () => setSheet(true)}
        />
      </Group>

      {sheet && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 px-8">
          <div className="panel-rise w-full max-w-[280px] overflow-hidden rounded-[14px] bg-white/95 text-center">
            <div className="px-4 pb-4 pt-5">
              <p className="text-[17px] font-semibold text-black">优化存储空间</p>
              <p className="mt-1 text-[13px] leading-snug text-black">需要二次确认。确认后将无法恢复。</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black/10 border-t border-black/10 text-[17px]">
              <button onClick={() => setSheet(false)} className="py-3 text-[#007aff] active:bg-black/5">取消</button>
              <button onClick={confirm} className="py-3 font-semibold text-[#007aff] active:bg-black/5">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
