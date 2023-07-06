export default function Ban( props ) {
  return (
    <div className="bg-stone-200 w-full h-48 ml-12 mr-12 rounded-2xl pt-5 pb-5 flex flex-col justify-center">
      {props.number && <h1 className="text-5xl text-royalblue font-extrabold">{props.number.toLocaleString("en-US")}</h1>}
      {props.text1 && <p className="text-lg text-royalblue">{props.text1}</p>}
      {props.text2 && <p className="text-sm text-royalblue">{props.text2}</p>}
      {props.text3 && <p className="text-base text-royalblue pt-1 italic">{props.text3}</p>}
    </div>
  )
}