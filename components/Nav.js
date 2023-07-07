export default function Nav( {genreFocus} ) {
  return (
    <div className="flex-row-center bg-slate-900 text-white w-full h-fit fixed top-0 z-20">
      <div className="flex-justify-start w-1/2 py-3 px-5">
        <h1 className="font-extrabold text-xl shrink">
        <a href="/" className="font-extrabold text-xl shrink hover:text-stone-300">Data Story</a>
        </h1>
      </div>
      <div className="flex-justify-end w-1/2 py-3 px-5">
        <h1 className="text-slate-400 text-sm shrink">
          <a
            href="https://github.com/ongyiumark"
            className="hover:text-slate-500"
          >
            Mark Kevin A. Ong Yiu
          </a>{" "}
          and David Demitri Africa
        </h1>
      </div>
    </div>
  );
}
