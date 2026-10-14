import { Navigate, useNavigate } from 'react-router-dom';
import { useGame } from '../../game/GameState';

export default function Ending() {
  const navigate = useNavigate();
  const { adminOpen, ending, finish, reset } = useGame();
  if (!adminOpen) return <Navigate to="/" replace />;

  return (
    <div className="w-full min-h-screen bg-black text-zinc-300 flex items-center justify-center p-8">
      <div className="max-w-md leading-loose text-sm">
        {!ending ? (
          <>
            <p className="mb-6">
              每一条被改过的记录，签名都是你。
              <br />
              分手之后，你从没真正退出过她的家。那一晚，你锁上了门，关掉了保护。
              <br />
              之后你做的一切，都是在向自己证明：这只是一次设备故障。
            </p>
            <p className="mb-8 text-zinc-500">现在，选择吧。</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => finish('confess')} className="border border-zinc-600 py-3 hover:bg-white hover:text-black transition-all">
                自首，把所有记录交给警方
              </button>
              <button onClick={() => finish('hide')} className="border border-zinc-600 py-3 hover:bg-white hover:text-black transition-all">
                继续隐藏，把后台关掉
              </button>
            </div>
          </>
        ) : (
          <>
            {ending === 'confess' ? (
              <p>
                你没有再修改任何一条记录，把手机交了出去。
                <br />
                原始的日志完整地躺在那里，一条都没有少。
                <br />
                她已经火化了。这些没被改动的记录，是她留下的唯一证词。
              </p>
            ) : (
              <p>
                你关掉了后台，日志重新变得干干净净。
                <br />
                但 HomeMind 没有忘记。它只是在等，等下一个打开它的人。
                <br />
                总有一天，会有人发现那个签名。
              </p>
            )}
            <button
              onClick={() => {
                reset();
                navigate('/');
              }}
              className="mt-10 text-zinc-500 underline hover:text-white"
            >
              重新开始
            </button>
          </>
        )}
      </div>
    </div>
  );
}
