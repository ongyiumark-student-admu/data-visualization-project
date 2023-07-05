import clientPromise from "../lib/mongodb";
import dynamic from 'next/dynamic';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

import styles from "../styles/global.module.css"

export default function Games({ 
  heatmapData, 
  heatmapOptions, 
  genreFocus, 
  focusOptions
}) {

    return (
        <div className={styles.flexColumn}>
            <ApexCharts options={heatmapOptions} series={heatmapData.filter((game) => game.name == genreFocus)} type="heatmap" height={150} width={1100} />
            <ApexCharts options={focusOptions} series={heatmapData.filter((game) => game.name != genreFocus)} type="heatmap" height={600} width={1100} />
        </div>
    );
}

async function getHeatmapData() {
  try {
    const client = await clientPromise;
    const db = client.db("steam_games");

    // query the database for genre-year counts
    const games = await db
      .collection("games")
      .aggregate([
        { $project: { _id: 0, converted_date: 1, genres: 1, year: { $year : "$converted_date" } } },
        { $match : { $and : [ { year : { $gte: 2009 } }, { year : { $lte: 2022 } }, { genres : "Indie" } ]}},
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
      for (let i = 2009; i <= 2022; i++) {
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
      colors: ["#016329"],
      title: { text: 'HeatMap Chart of Steam Indie Game Genres Over Time' },
      plotOptions: { heatmap: { shadeIntensity: 0.9 } }
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

export async function getStaticProps() {
  try {
    const heatmapProps = await getHeatmapData() 
      
    return {
      props: { 
        ...heatmapProps,
        genreFocus: "Indie"
      },
    };
  } catch (e) {
    console.error(e);
  }
}