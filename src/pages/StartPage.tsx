import { useNavigate } from 'react-router-dom';
import { useGame } from '../game/GameState';

export default function StartPage() {
  const navigate = useNavigate();
  const { found, habit, reset } = useGame();
  const started = found.length > 0;
  return (
    <div className="text-center max-w-sm px-6">
      <h1 className="text-3xl font-bold mb-6 tracking-widest text-slate-300">HOME MIND</h1>
      <p className="text-sm text-slate-400 leading-loose mb-8">
        你整理她的遗物时，发现了一份手机备份。
        <br />
        她已经火化了，留下的只有这些记录。
        <br />
        系统提示：部分记录可能被编辑过。</p>
      <button
        onClick={() => navigate(habit ? '/phone' : '/panel')}
        className="px-10 py-3 border border-slate-600 text-slate-200 hover:bg-white hover:text-black transition-all"
      >
        {started ? '继续' : 'START'}
      </button>
      {started && (
        <button
          onClick={() => {
            if (window.confirm('清除所有进度重新开始?')) reset();
          }}
          className="block mx-auto mt-4 text-xs text-slate-500 underline hover:text-slate-300"
        >
          重新开始
        </button>
      )}
    </div>
  );
}
