import Head from "next/head";
import clientPromise from "../lib/mongodb";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

import Nav from "../components/Nav.js";
import Ban from "../components/Ban.js";
import { getGradientColor, linspace } from "../lib/utilities.js";

export default function Genres({
  genreFocus,
  heatmapData,
  gameCountData,
  gamePriceData,
  topGamesCCU,
  topDevsCount,
  gameCountNoFilter,
  totalGenreFocus,
  totalGenreDevelopers,
  mostExpensiveGame,
  heatmapOptions,
  lineChartOptions,
  barChartOptions,
  colors,
  foreColor,
}) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Nav genreFocus={genreFocus} />
      <div className="flex-row-center mt-24 shrink">
        <h1 className="text-royalblue text-5xl font-extrabold">{genreFocus} Steam Games</h1>
      </div>
      <div className="flex-row-center flex-wrap my-12">
        <Ban
          number={totalGenreFocus}
          text1={`${genreFocus} Steam Games`}
          text2="from 2009 to 2022"
        />
        <Ban
          number={`$${mostExpensiveGame.price}`}
          text1={`Most Expensive ${genreFocus} Game`}
          text2="from 2009 to 2022"
          text3={mostExpensiveGame.name}
        />
        <Ban
          number={totalGenreDevelopers}
          text1={`${genreFocus} Game Developers`}
          text2="from 2009 to 2022"
        />
      </div>

      {/* Heatmaps */}
      <div className="flex-col-center my-12 w-full">
        <div className="flex-col-center w-4/5">
          <h1 className="text-xl font-bold">{`${genreFocus}`} Game Genres</h1>
          <p className="text-sm">Yearly Count from 2009 to 2022</p>
          <div className="flex-row-center w-full">
            <ApexCharts
              className="flex-row-center w-4/5"
              options={{
                ...heatmapOptions,
                yaxis: {
                  labels: {
                    style: { cssClass: "text-lg font-bold px-3 translate-y-1" },
                  },
                },
              }}
              series={heatmapData.filter((game) => game.name == genreFocus)}
              type="heatmap"
              height={90}
            />
          </div>
          <ApexCharts
            className="flex-row-center w-full"
            options={heatmapOptions}
            series={heatmapData.filter((game) => game.name != genreFocus)}
            type="heatmap"
            height={600}
          />
        </div>

        {/* Line Charts */}
        <div className="flex-row-center flex-wrap w-4/5 mt-20 mb-6">
          <div className="flex-col-center dynamic-w-lg m-6">
            <h1 className="text-lg font-bold">
              Number of {`${genreFocus}`} Games
            </h1>
            <p className="text-xs">Monthly Count from Jan 2009 to Dec 2022</p>
            <ApexCharts
              className="flex-row-center w-full"
              options={lineChartOptions}
              series={gameCountData}
              type="line"
              height={300}
            />
          </div>

          <div className="flex-col-center dynamic-w-lg m-6">
            <h1 className="font-bold text-lg">
              Price of {`${genreFocus}`} Games (USD)
            </h1>
            <p className="text-xs">Monthly Average from Jan 2009 to Dec 2022</p>
            <ApexCharts
              className="flex-row-center w-full"
              options={{
                ...lineChartOptions,
                yaxis: {
                  labels: {
                    formatter: function (label) {
                      return `$${Math.round(label * 100) / 100}`;
                    },
                  },
                },
              }}
              series={gamePriceData}
              type="line"
              height={300}
            />
          </div>
        </div>

        {/* Bar Charts */}
        <div className="flex-row-center flex-wrap w-4/5 my-6">
          <div className="flex-col-center dynamic-w-lg m-6">
            <h1 className="font-bold text-lg">
              Top 10 {`${genreFocus}`} Games
            </h1>
            <p className="text-xs">Peak Concurrent Users</p>
            <ApexCharts
              className="flex-row-center w-full"
              options={{
                ...barChartOptions
              }}
              series={topGamesCCU}
              type="bar"
              height={300}
            />
          </div>

          <div className="flex-col-center dynamic-w-lg m-6">
            <h1 className="font-bold text-lg">
              Top 10 {`${genreFocus}`} Game Developers
            </h1>
            <p className="text-xs">
              Number of {`${genreFocus}`} Games Developed
            </p>
            <ApexCharts
              className="flex-row-center w-full"
              options={barChartOptions}
              series={topDevsCount}
              type="bar"
              height={300}
            />
          </div>
        </div>

        {/* Dual Line Chart */}
        <div className="flex-col-center w-4/5 my-12">
          <h1 className="text-xl font-bold">
            Number of {`${genreFocus}`} Games vs. Number of All Games
          </h1>
          <p className="text-sm">Monthly Count from Jan 2009 to Dec 2022</p>
          <ApexCharts
            className="flex-row-center w-full"
            options={{
              ...lineChartOptions,
              colors: [colors[1], colors[0]],
            }}
            series={gameCountNoFilter}
            type="line"
            height={300}
          />
        </div>
      </div>
    </>
  );
}

async function getHeatmapData(
  db,
  genreFocus,
  l_year,
  r_year,
  colors,
  foreColor
) {
  try {
    // query the database for genre-year counts
    const games = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            genres: 1,
            year: { $year: "$converted_date" },
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: l_year } },
              { year: { $lte: r_year } },
              { genres: genreFocus },
            ],
          },
        },
        { $unwind: "$genres" },
        {
          $group: {
            _id: { year: { $year: "$converted_date" }, genre: "$genres" },
            games_count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // convert to apexchart format
    let game_genres = {};
    for (let game of games) {
      const { genre, year } = game._id;
      if (!(genre in game_genres)) game_genres[genre] = {};
      game_genres[genre][year] = game.games_count;
    }
    for (let genre in game_genres) {
      for (let i = l_year; i <= r_year; i++) {
        if (!(i in game_genres[genre])) game_genres[genre][i] = 0;
      }
    }

    // order lexicographically
    const ordered_genres = Object.keys(game_genres)
      .sort()
      .reverse()
      .reduce((obj, key) => {
        obj[key] = game_genres[key];
        return obj;
      }, {});

    let max_val = 0;
    // finish converting to apexchart format
    let heatmap_series = [];
    for (let genre in ordered_genres) {
      const tmp = {};
      tmp["name"] = genre;
      tmp["data"] = [];
      for (let year in game_genres[genre]) {
        tmp["data"].push({ x: year, y: game_genres[genre][year] });
        if (genre != genreFocus)
          max_val = Math.max(max_val, game_genres[genre][year]);
      }
      heatmap_series.push(tmp);
    }

    // options for heatmap
    let n_ranges = 20;
    let color_percent = linspace(0.1, 1, n_ranges);
    let to_from = linspace(1, max_val, n_ranges);
    let ranges = [];
    for (let i = 0; i < n_ranges - 1; i++) {
      let tmp = {
        from: to_from[i],
        to: to_from[i + 1],
        color: getGradientColor(
          "#FFFFFF",
          colors[0],
          Math.sqrt(color_percent[i + 1])
        ),
      };
      ranges.push(tmp);
    }
    ranges.push({ from: 0, to: 0, color: "#FFFFFF" });

    let heatmapOptions = {
      chart: { type: "heatmap", foreColor: foreColor },
      dataLabels: { enabled: false },
      colors: [colors[0]],
      plotOptions: {
        heatmap: {
          shadeIntensity: 1,
          enableShades: false,
          useFillColorAsStroke: false,
          colorScale: { ranges: ranges },
        },
      },
      legend: { show: false },
    };

    let totalGenreFocus = 0;
    let genreFocusData = heatmap_series.filter((g) => g.name == genreFocus);
    for (let d of genreFocusData[0].data) totalGenreFocus += d.y;

    return {
      heatmapData: JSON.parse(JSON.stringify(heatmap_series)),
      heatmapOptions: heatmapOptions,
      totalGenreFocus: totalGenreFocus,
    };
  } catch (e) {
    console.error(e);
  }
}

async function getTimeData(db, genreFocus, l_year, r_year, colors, foreColor) {
  try {
    // query the database for monthly data on price and number of games
    const timeData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            price: 1,
            year: { $year: "$converted_date" },
            genres: 1,
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: l_year } },
              { year: { $lte: r_year } },
              { genres: genreFocus },
            ],
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$converted_date" },
              month: { $month: "$converted_date" },
            },
            games_count: { $sum: 1 },
            avg_price: { $avg: "$price" },
          },
        },
      ])
      .toArray();

    const timeDataNoFilter = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            price: 1,
            year: { $year: "$converted_date" },
          },
        },
        {
          $match: {
            $and: [{ year: { $gte: l_year } }, { year: { $lte: r_year } }],
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$converted_date" },
              month: { $month: "$converted_date" },
            },
            games_count: { $sum: 1 },
            avg_price: { $avg: "$price" },
          },
        },
      ])
      .toArray();

    // sort data
    timeData.sort((a, b) => {
      let a_month = a._id.month;
      let a_year = a._id.year;
      let b_month = b._id.month;
      let b_year = b._id.year;
      if (a_year == b_year) return a_month - b_month;
      else return a_year - b_year;
    });
    timeDataNoFilter.sort((a, b) => {
      let a_month = a._id.month;
      let a_year = a._id.year;
      let b_month = b._id.month;
      let b_year = b._id.year;
      if (a_year == b_year) return a_month - b_month;
      else return a_year - b_year;
    });

    let gameCountData = [
      {
        name: `${genreFocus} Games`,
        data: timeData.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.games_count,
        })),
      },
    ];

    let gameCountNoFilter = [
      {
        name: `All Games`,
        data: timeDataNoFilter.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.games_count,
        })),
      },
      gameCountData[0],
    ];

    let gamePriceData = [
      {
        name: `${genreFocus} Game Price (USD)`,
        data: timeData.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.avg_price,
        })),
      },
    ];

    let lineChartOptions = {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: { type: "x", enabled: true, autoScaleYaxis: true },
        toolbar: { autoSelected: "zoom" },
        foreColor: foreColor,
      },
      stroke: { width: 2 },
      colors: [colors[0]],
      xaxis: { type: "datetime" },
      yaxis: { min: 0 },
      tooltip: { x: { format: "dd MMM yyyy" } },
    };

    return {
      gameCountData: gameCountData,
      gamePriceData: gamePriceData,
      gameCountNoFilter: gameCountNoFilter,
      lineChartOptions: lineChartOptions,
    };
  } catch (e) {
    console.error(e);
  }
}

async function getBarData(db, genreFocus, l_year, r_year, colors, foreColor) {
  try {
    // query the database for top indie games based on peak ccu
    const ccuData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            peak_ccu: 1,
            year: { $year: "$converted_date" },
            genres: 1,
            name: 1,
            short_description: 1
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: l_year } },
              { year: { $lte: r_year } },
              { genres: genreFocus },
            ],
          },
        },
        { $project: { _id: 0, name: 1, peak_ccu: 1, short_description: 1 } },
      ])
      .sort({ peak_ccu: -1 })
      .limit(10)
      .toArray();

    let topGamesCCU = [
      {
        name: `Peak Concurrent Users`,
        data: ccuData.map((tdata) => ({
          x: tdata.name,
          y: tdata.peak_ccu,
          description: tdata.short_description
        })),
      },
    ];

    // query the database for top indie game developers
    const devData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            year: { $year: "$converted_date" },
            genres: 1,
            developers: 1,
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: 2009 } },
              { year: { $lte: 2022 } },
              { genres: genreFocus },
            ],
          },
        },
        { $unwind: "$developers" },
        { $group: { _id: "$developers", games_count: { $sum: 1 } } },
      ])
      .sort({ games_count: -1 })
      .limit(10)
      .toArray();

    let topDevsCount = [
      {
        name: `Number of ${genreFocus} Games Developed`,
        data: devData.map((tdata) => ({
          x: tdata._id,
          y: tdata.games_count,
        })),
      },
    ];

    let barChartOptions = {
      chart: { type: "bar", height: 350, foreColor: foreColor },
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, horizontal: true } },
      colors: [colors[0]],
    };

    return {
      topGamesCCU: topGamesCCU,
      topDevsCount: topDevsCount,
      barChartOptions: barChartOptions,
    };
  } catch (e) {
    console.error(e);
  }
}

async function getBanData(db, genreFocus, l_year, r_year, colors, foreColor) {
  try {
    const devData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            year: { $year: "$converted_date" },
            genres: 1,
            developers: 1,
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: 2009 } },
              { year: { $lte: 2022 } },
              { genres: genreFocus },
            ],
          },
        },
        { $unwind: "$developers" },
        { $group: { _id: "$developers", games_count: { $sum: 1 } } },
      ])
      .toArray();

    const priceData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            year: { $year: "$converted_date" },
            genres: 1,
            price: 1,
            name: 1
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: 2009 } },
              { year: { $lte: 2022 } },
              { genres: genreFocus },
            ],
          },
        },
      ])
      .sort({ price: -1 })
      .limit(1)
      .toArray();
    return {
      totalGenreDevelopers: devData.length,
      mostExpensiveGame: {
        price: priceData[0].price,
        name: priceData[0].name
      }
    };
  } catch (e) {
    console.log(e);
  }
}

export async function getStaticProps({ params }) {
  try {
    const client = await clientPromise;
    const db = client.db("steam_games");

    let genreFocus = params.id;
    let l_year = 2009;
    let r_year = 2022;
    let colors = ["#0504aa", "#006600"];
    let foreColor = "#0e1629";

    const heatmapProps = await getHeatmapData(
      db,
      genreFocus,
      l_year,
      r_year,
      colors,
      foreColor
    );
    const timeProps = await getTimeData(
      db,
      genreFocus,
      l_year,
      r_year,
      colors,
      foreColor
    );
    const barProps = await getBarData(
      db,
      genreFocus,
      l_year,
      r_year,
      colors,
      foreColor
    );
    const banProps = await getBanData(
      db,
      genreFocus,
      l_year,
      r_year,
      colors,
      foreColor
    );

    return {
      props: {
        ...heatmapProps,
        ...timeProps,
        ...barProps,
        ...banProps,
        genreFocus: genreFocus,
        colors: colors,
        foreColor: foreColor,
      },
    };
  } catch (e) {
    console.error(e);
  }
}

export async function getStaticPaths() {
  try {
    const client = await clientPromise;
    const db = client.db("steam_games");

    const genres = await db
      .collection("games")
      .aggregate([
        { $project: { genres: 1 } },
        { $unwind: "$genres" },
        { $group: { _id: { genres: "$genres" }, n: { $sum: 1 } } },
      ])
      .toArray();

    const result = genres.map((g) => ({
      params: { id: g._id.genres },
    }));

    return {
      paths: result,
      fallback: false,
    };
  } catch (e) {
    console.log(e);
  }
}
