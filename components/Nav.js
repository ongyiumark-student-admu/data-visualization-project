export default function Nav( {genreFocus} ) {
  return (
    <>
    <div className="flex-row-center bg-slate-900 text-white w-full h-16 sticky top-0 z-20 mb-10">
      <div className="flex-justify-start w-1/2 py-3 px-5">
        <h1 className="font-extrabold text-xl shrink">
        <ul className="flex-justify-start">
        <li className="flex-row-center"><a href="/" className="font-extrabold text-xl shrink hover:text-stone-300 mx-3">
          Home</a></li>
          <li className="flex-row-center"><a href="/Indie" className="font-extrabold text-xl shrink hover:text-stone-300 mx-3">
          Data Story</a></li>
        </ul>

        </h1>
      </div>
      <div className="flex-justify-end w-1/2 py-3 px-5">
        <h1 className="text-slate-400 text-xs shrink resize">
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
    </>
  );
}
