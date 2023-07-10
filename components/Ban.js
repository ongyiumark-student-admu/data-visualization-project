export default function Ban( props ) {
  return (
    <div className="flex-col-center bg-stone-200 dynamic-w-fit h-52 rounded-2xl py-5 m-5">
      {(props.number !== null) && <h1 className="text-5xl text-royalblue font-extrabold mx-5 w-64">{props.number.toLocaleString("en-US")}</h1>}
      {(props.text1 !== null) && <p className="text-lg text-royalblue mx-5 w-64">{props.text1}</p>}
      {(props.text2 !== null) && <p className="text-sm text-royalblue mx-5 w-64">{props.text2}</p>}
      {(props.text3 !== null) && <p className="text-base text-royalblue italic mx-5 my-2 w-64">{props.text3}</p>}
    </div>
  )
}