import clientPromise from "../lib/mongodb";
import dynamic from 'next/dynamic';
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });


export default function Games({ games }) {
    let heatmap_options = {
      chart: {
        type: 'heatmap'
      },
      dataLabels: {
        enabled: false
      },
      colors: ["#016329"],
      title: {
        text: 'HeatMap Chart of Steam Indie Game Genres Over Time'
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.9,
        }
      }
    }
    let highlight_options = { ...heatmap_options }
    highlight_options['title'] = {
      text: ''
    }

    let highlight = "Indie"

    let style = {
      display: "flex",
      alignItems: "center",
      flexDirection: "column"
    }

    return (
        <div style={style}>
            <ApexCharts options={heatmap_options} series={games.filter((game) => game.name == highlight)} type="heatmap" height={200} width={1100} />
            <ApexCharts options={highlight_options} series={games.filter((game) => game.name != highlight)} type="heatmap" height={600} width={1100} />

            <style jsx global>{`
              body {
                backgroundColor: "red";
              }
            `}</style>
        </div>
    );
}

export async function getStaticProps() {
    try {
        const client = await clientPromise;
        const db = client.db("steam_games");

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

        const ordered_genres = Object.keys(game_genres).sort().reverse().reduce(
          (obj, key) => {
            obj[key] = game_genres[key]
            return obj
          },
          {}
        )
      
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

        return {
            props: { 
              games: JSON.parse(JSON.stringify(heatmap_series)),
              isDark: true
            },
        };
    } catch (e) {
        console.error(e);
    }
}