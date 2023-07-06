export default function Nav() {
  return (
    <div className="flex bg-slate-900 items-center justify-center text-white w-full h-14 fixed top-0 z-20">
      <div className="flex w-1/2 items-start">
        <h1 className="ml-7 font-extrabold text-xl">Data Story</h1>
      </div>
      <div className="flex-row w-1/2 items-end text-right">
        <h1 className="mr-7 text-slate-400 text-sm">
          <a href="https://github.com/ongyiumark" className="hover:text-slate-500">Mark Kevin A. Ong Yiu</a> and David Demitri Africa
        </h1>
      </div>
    </div>
  );
}