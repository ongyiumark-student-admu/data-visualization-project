import clientPromise from "../lib/mongodb";
import dynamic from 'next/dynamic';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

import styles from "../styles/global.module.css"

export default function Games({ 
  heatmapData, 
  heatmapOptions, 
  genreFocus, 
  focusOptions,
  gameCountData,
  gamePriceData,
  lineChartOptions,
  topGamesCCU,
  topDevsCount,
  gameCountNoFilter,
  barChartOptions
}) {
  return (
    <div className={styles.flexColumn}>
      <ApexCharts options={heatmapOptions} series={heatmapData.filter((game) => game.name == genreFocus)} type="heatmap" height={150} width={1100} />
      <ApexCharts options={focusOptions} series={heatmapData.filter((game) => game.name != genreFocus)} type="heatmap" height={600} width={1100} />
      
      <div className={styles.flexRow} >
        <ApexCharts options={lineChartOptions} series={gameCountData} type="line" height={300} width={600} />
        <ApexCharts options={lineChartOptions} series={gamePriceData} type="line" height={300} width={600} />
      </div>

      <div className={styles.flexRow}>
        <ApexCharts options={barChartOptions} series={topGamesCCU} type="bar" height={300} width={600} />
        <ApexCharts options={barChartOptions} series={topDevsCount} type="bar" height={300} width={600} />
      </div>

      <ApexCharts options={lineChartOptions} series={gameCountNoFilter} type="line" height={300} width={1100} />
    </div>
  );
}

async function getHeatmapData(db, genreFocus, l_year, r_year, color) {
  try {
    // query the database for genre-year counts
    const games = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, genres: 1, year: { $year : "$converted_date" } } },
        { $match : { $and : [ { year : { $gte: l_year } }, { year : { $lte: r_year } }, { genres : genreFocus } ]}},
        { $unwind : "$genres" },
        { $group: 
          {
            _id: { year: { $year: "$converted_date" }, genre: "$genres"},
            games_count: { $sum : 1 },
          }
        },
      ])
      .toArray();

    // convert to apexchart format 
    let game_genres = {}
    for (let game of games) {
      const { genre, year } = game._id
      if (!(genre in game_genres)) game_genres[genre] = {}
      game_genres[genre][year] = game.games_count;
    }
    for (let genre in game_genres) {
      for (let i = l_year; i <= r_year; i++) {
        if (!(i in game_genres[genre])) game_genres[genre][i] = 0
      }
    }

    // order lexicographically
    const ordered_genres = Object.keys(game_genres).sort().reverse().reduce(
      (obj, key) => {
        obj[key] = game_genres[key]
        return obj
      },
      {}
    )
  
    // finish converting to apexchart format
    let heatmap_series = []
    for (let genre in ordered_genres) {
      const tmp = {}
      tmp['name'] = genre
      tmp['data'] = []
      for (let year in game_genres[genre]) {
        tmp['data'].push({ 'x': year, 'y': game_genres[genre][year] })
      }
      heatmap_series.push(tmp)
    }

    // options for heatmap
    let heatmapOptions = {
      chart: { type: 'heatmap' },
      dataLabels: { enabled: false },
      colors: [color],
      title: { text: 'HeatMap Chart of Steam Indie Game Genres Over Time' },
      plotOptions: { 
        heatmap: { shadeIntensity: 0.2, enableShades: true, useFillColorAsStroke: false,
          colorScale: { min : 5000 }
        } 
      }
    }
    let focusOptions = { ...heatmapOptions, title: { text: ' '} }

    return { 
      heatmapData : JSON.parse(JSON.stringify(heatmap_series)),
      heatmapOptions : heatmapOptions,
      focusOptions: focusOptions
    };
  } catch (e) {
    console.error(e);
  }
}

async function getTimeData(db, genreFocus, l_year, r_year, color) {
  try {
    // query the database for monthly data on price and number of games
    const timeData = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, price: 1, year: { $year : "$converted_date" }, genres: 1 } },
        { $match : { $and : [ { year : { $gte: l_year } }, { year : { $lte: r_year } }, { genres : genreFocus } ]}},
        { $group: 
          {
            _id: { year: { $year: "$converted_date" }, month: { $month: "$converted_date" } },
            games_count: { $sum : 1 },
            avg_price: { $avg: '$price'}
          }
        },
      ])
      .toArray();
      
    const timeDataNoFilter = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, price: 1, year: { $year : "$converted_date" } } },
        { $match : { $and : [ { year : { $gte: l_year } }, { year : { $lte: r_year } } ]}},
        { $group: 
          {
            _id: { year: { $year: "$converted_date" }, month: { $month: "$converted_date" } },
            games_count: { $sum : 1 },
            avg_price: { $avg: '$price'}
          }
        },
      ])
      .toArray();

    // sort data
    timeData.sort((a, b) => {
      let a_month = a._id.month
      let a_year = a._id.year
      let b_month = b._id.month
      let b_year = b._id.year
      if (a_year == b_year) return a_month-b_month
      else return a_year-b_year
    })
    timeDataNoFilter.sort((a, b) => {
      let a_month = a._id.month
      let a_year = a._id.year
      let b_month = b._id.month
      let b_year = b._id.year
      if (a_year == b_year) return a_month-b_month
      else return a_year-b_year
    })

    let gameCountData = [{
      name: `${genreFocus} Game Count`,
      data: timeData.map((tdata) => ({ 
        x: `${tdata._id.year}-${tdata._id.month}`,
        y: tdata.games_count
      }))  
    }]

    let gameCountNoFilter = [{
      name: `Game Count`,
      data: timeDataNoFilter.map((tdata) => ({ 
        x: `${tdata._id.year}-${tdata._id.month}`,
        y: tdata.games_count
      }))  
    }, ...gameCountData]

    let gamePriceData = [{
      name: `${genreFocus} Game Price (USD)`,
      data: timeData.map((tdata) => ({ 
        x: `${tdata._id.year}-${tdata._id.month}`,
        y: Math.round(tdata.avg_price*100)/100
      }))  
    }]


    let lineChartOptions = {
      chart: { 
        type: 'area', stacked: true, height: 350, zoom: { type: 'x', enabled: true, 'autoScaleYaxis': true}, 
        toolbar: { autoSelected: 'zoom'} 
      },
      colors: [color, "#775DD0"],
      xaxis: { type: "datetime" },
      yaxis: { min: 0 },
      tooltip: { x: { format: 'dd MMM yyyy' } }
    }

    // let areaChartOptions = {
    //   chart: { 
    //     type: 'area', stacked: false, height: 350, zoom: { type: 'x', enabled: true, 'autoScaleYaxis': true}, 
    //     toolbar: { autoSelected: 'zoom'}, id: 'area-datetime' 
    //   },
    //   colors: [color],
    //   xaxis: { type: "datetime" },
    //   yaxis: { min: 0 }
    // }

    return {
      gameCountData: gameCountData,
      gamePriceData: gamePriceData,
      gameCountNoFilter: gameCountNoFilter,
      lineChartOptions: lineChartOptions,
      // areaChartOptions: areaChartOptions
    }
  } catch (e) {
    console.error(e);
  }
}

async function getBarData(db, genreFocus, l_year, r_year, color) {
  try {
    // query the database for top indie games based on peak ccu
    const ccuData = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, peak_ccu: 1, year: { $year : "$converted_date" }, genres: 1, name: 1 } },
        { $match : { $and : [ { year : { $gte: l_year } }, { year : { $lte: r_year } }, { genres : genreFocus } ]}},
        { $project: { _id: 0, name: 1, peak_ccu: 1} }
      ])
      .sort({peak_ccu : -1})
      .limit(10)
      .toArray();

    let topGamesCCU = [{
      name: `Top 10 ${genreFocus} Games (by Peak Concurrent Users)`,
      data: ccuData.map((tdata) => ({ 
        x: tdata.name,
        y: tdata.peak_ccu
      }))  
    }]

    // query the database for top indie game developers
    const devData = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, year: { $year : "$converted_date" }, genres: 1, developers: 1} },
        { $match : { $and : [ { year : { $gte: 2009 } }, { year : { $lte: 2022 } }, { genres : genreFocus } ]}},
        { $unwind: "$developers"},
        { $group: { _id : "$developers", games_count: { $sum : 1} } }
      ])
      .sort({games_count : -1})
      .limit(10)
      .toArray();
    
    let topDevsCount = [{
      name: `Top 10 ${genreFocus} Developers (by Number of Games)`,
      data: devData.map((tdata) => ({ 
        x: tdata._id,
        y: tdata.games_count
      }))  
    }]

    let barChartOptions = {
      chart: { type: 'bar', height: 350 },
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, horizontal: true } },
      colors: [color]
    }

    return {
      topGamesCCU: topGamesCCU,
      topDevsCount: topDevsCount,
      barChartOptions: barChartOptions
    }
  } catch (e) {
    console.error(e);
  }
}

export async function getStaticProps() {
  try {
    const client = await clientPromise;
    const db = client.db("steam_games");
    let genreFocus = "Indie"
    let l_year = 2009
    let r_year = 2022
    let color = "#16cc62"

    const heatmapProps = await getHeatmapData(db, genreFocus, l_year, r_year, color) 
    const timeProps = await getTimeData(db, genreFocus, l_year, r_year, color) 
    const barProps = await getBarData(db, genreFocus, l_year, r_year, color) 
      
    return {
      props: { 
        ...heatmapProps,
        ...timeProps,
        ...barProps,
        genreFocus: genreFocus
      },
    };
  } catch (e) {
    console.error(e);
  }
}