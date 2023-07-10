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
  topGamesCCU,
  topDevsCount,
  topGameFullData,
  gameCountNoFilter,
  gamePriceNoFilter,
  gameScoreNoFilter,
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

      <div className="snap-y lg:snap-mandatory snap-proximity w-screen h-screen overflow-y-scroll">
        <Nav genreFocus={genreFocus} />
        <div className="snap-member">
          <div className="flex-row-member shrink">
            <h1 className="text-royalblue text-5xl font-extrabold">
              {genreFocus} Steam Games
            </h1>
          </div>
          <div className="flex-row-center flex-wrap mt-3 mb-6">
            <Ban
              number={totalGenreFocus}
              text1={`${genreFocus} Steam Games`}
              text2="from 2009 to 2022"
            />
            <Ban
              number={totalGenreDevelopers}
              text1={`${genreFocus} Game Developers`}
              text2="from 2009 to 2022"
            />
            <Ban
              number={`$${mostExpensiveGame.price}`}
              text1={`Most Expensive ${genreFocus} Game`}
              text2="from 2009 to 2022"
              text3={mostExpensiveGame.name}
            />
            <Ban
              number={topGameFullData.peak_ccu}
              text1={`Highest Peak Concurrent Users`}
              text2={`${genreFocus} Games from 2009 to 2022`}
              text3={topGameFullData.name}
            />
          </div>

          <div className="flex-row-center px-10 py-6 w-11/12 shrink text-royalblue text-justify flex-wrap">
            <img
              src={topGameFullData.header_image}
              className="rounded-xl m-5"
            ></img>
            <div className="flex flex-col dynamic-w-sm">
              <h1 className="font-extrabold text-4xl">
                {topGameFullData.name}
              </h1>
              <p className="font-bold text-lg">
                {topGameFullData.peak_ccu.toLocaleString("en-US")} Peak
                Concurrent Users
              </p>
              <p className="instructions">
                {genreFocus} Game with highest peak concurrent users in Steam as
                of Dec 2022
              </p>

              <p className="my-3 text-justify max-w-xl">
                {topGameFullData.short_description}
              </p>

              <div className="text-justify">
                <p>
                  <span className="text-slate-700">Release Date:</span>{" "}
                  {topGameFullData.release_date}
                </p>
                <p>
                  <span className="text-slate-700">Metacritic Score:</span>{" "}
                  {topGameFullData.metacritic_score}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="snap-member" id="section-heatmap">
          <div className="flex-col-center w-11/12">
            <h1 className="text-2xl font-bold">
              {`${genreFocus}`} Game Genres
            </h1>
            <p className="text-base">Yearly Count from 2009 to 2022</p>
            <p className="instructions">You may hover to inspect the value</p>
            <div className="flex-row-center w-full">
              <h1 className="text-lg font-bold -translate-y-1">{genreFocus}</h1>
              <ApexCharts
                className="flex-row-center w-10/12"
                options={{
                  ...heatmapOptions,
                  yaxis: { show: false },
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
              height={500}
            />
          </div>
        </div>

        <div className="snap-member" id="section-line">
          <div className="flex-row-center flex-wrap w-4/5">
            <div className="flex-col-center dynamic-w-lg mb-6">
              <h1 className="text-xl font-bold">
                Number of {`${genreFocus}`} Games
              </h1>
              <p className="text-base">
                Monthly Count from Jan 2009 to Dec 2022
              </p>
              <p className="instructions">
                You may click the buttons to navigate and highlight to zoom
              </p>
              <ApexCharts
                className="flex-row-center w-full"
                options={lineChartOptions}
                series={[gameCountNoFilter[1]]}
                type="line"
                height={230}
              />
            </div>

            <div className="flex-col-center dynamic-w-lg mb-6">
              <h1 className="font-bold text-xl">
                Price of {`${genreFocus}`} Games (USD)
              </h1>
              <p className="text-base">
                Monthly Average Price in USD from Jan 2009 to Dec 2022
              </p>
              <p className="instructions">
                You may click the buttons to navigate and highlight to zoom
              </p>
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
                series={[gamePriceNoFilter[1]]}
                type="line"
                height={230}
              />
            </div>

            <div className="flex-col-center dynamic-w-lg mb-6">
              <h1 className="font-bold text-xl">
                Metacritic Score of {`${genreFocus}`} Games
              </h1>
              <p className="text-base">
                Monthly Average Metacritic Score from Jan 2009 to Dec 2022
              </p>
              <p className="instructions">
                You may click the buttons to navigate and highlight to zoom
              </p>
              <ApexCharts
                className="flex-row-center w-full"
                options={{
                  ...lineChartOptions,
                  yaxis: {
                    labels: {
                      formatter: function (label) {
                        return `${Math.round(label * 100) / 100}`;
                      },
                    },
                  },
                }}
                series={[gameScoreNoFilter[1]]}
                type="line"
                height={230}
              />
            </div>
          </div>
        </div>

        <div className="snap-member" id="section-bar">
          <div className="flex-row-center flex-wrap w-11/12 mb-6">
            <div className="flex-col-center dynamic-w-lg mb-6">
              <h1 className="font-bold text-xl">
                Top 10 {`${genreFocus}`} Games
              </h1>
              <p className="text-base">Peak Concurrent Users</p>
              <p className="instructions">You may hover to inspect the value</p>
              <ApexCharts
                className="flex-row-center w-full"
                options={{
                  ...barChartOptions,
                }}
                series={topGamesCCU}
                type="bar"
                height={300}
              />
            </div>

            <div className="flex-col-center dynamic-w-lg mb-6">
              <h1 className="font-bold text-xl">
                Top 10 {`${genreFocus}`} Game Developers
              </h1>
              <p className="text-base">
                Number of {`${genreFocus}`} Games Developed
              </p>
              <p className="instructions">You may hover to inspect the value</p>
              <ApexCharts
                className="flex-row-center w-full"
                options={barChartOptions}
                series={topDevsCount}
                type="bar"
                height={300}
              />
            </div>
          </div>
        </div>

        <div className="snap-member">
          <div className="flex-row-center shrink">
            <h1 className="text-royalblue text-5xl font-extrabold">
              Comparative Analysis with All Games
            </h1>
          </div>
          <div className="flex-col-center w-4/5 my-12">
            <h1 className="text-2xl font-bold">
              Number of All Games vs. Number of {`${genreFocus}`} Games
            </h1>
            <p className="text-base">Monthly Count from Jan 2009 to Dec 2022</p>
            <p className="instructions">
              You may click the buttons to navigate and highlight to zoom
            </p>
            <p className="instructions">
              You may also click the labels to show and hide graphs
            </p>
            <ApexCharts
              className="flex-row-center w-full"
              options={{
                ...lineChartOptions,
                colors: [colors[1], colors[0]],
                dataLabels: { enabled: false },
              }}
              series={gameCountNoFilter}
              type="area"
              height={300}
            />
          </div>
        </div>
        <div className="snap-member">
          <div className="flex-col-center w-4/5 my-6">
            <h1 className="text-2xl font-bold">
              Price of All Games vs. Price of {`${genreFocus}`} Games (USD)
            </h1>
            <p className="text-base">
              Monthly Average Price in USD from Jan 2009 to Dec 2022
            </p>
            <p className="instructions">
              You may click the buttons to navigate and highlight to zoom
            </p>
            <p className="instructions">
              You may also click the labels to show and hide graphs
            </p>
            <ApexCharts
              className="flex-row-center w-full"
              options={{
                ...lineChartOptions,
                colors: [colors[1], colors[0]],
                yaxis: {
                  labels: {
                    formatter: function (label) {
                      return `$${Math.round(label * 100) / 100}`;
                    },
                  },
                },
              }}
              series={gamePriceNoFilter}
              type="line"
              height={300}
            />
          </div>
        </div>
        <div className="snap-member">
          <div className="flex-col-center w-4/5 my-6">
            <h1 className="text-2xl font-bold">
              Metacritic Score of All Games vs. Metacritic Score of{" "}
              {`${genreFocus}`} Games
            </h1>
            <p className="text-base">
              Monthly Average Metacritic Score from Jan 2009 to Dec 2022
            </p>
            <p className="instructions">
              You may click the buttons to navigate and highlight to zoom
            </p>
            <p className="instructions">
              You may also click the labels to show and hide graphs
            </p>
            <ApexCharts
              className="flex-row-center w-full"
              options={{
                ...lineChartOptions,
                colors: [colors[1], colors[0]],
                yaxis: {
                  labels: {
                    formatter: function (label) {
                      return `${Math.round(label * 100) / 100}`;
                    },
                  },
                },
              }}
              series={gameScoreNoFilter}
              type="line"
              height={300}
            />
          </div>
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
            metacritic_score: 1,
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
            avg_score: { $avg: "$metacritic_score" },
          },
        },
      ])
      .toArray();

    const timeMetacriticData = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            year: { $year: "$converted_date" },
            genres: 1,
            metacritic_score: 1,
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: l_year } },
              { year: { $lte: r_year } },
              { metacritic_score: { $gt: 0 } },
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
            avg_score: { $avg: "$metacritic_score" },
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
            metacritic_score: 1,
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
            avg_score: { $avg: "$metacritic_score" },
          },
        },
      ])
      .toArray();

    const timeMetacriticDataNoFilter = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            year: { $year: "$converted_date" },
            metacritic_score: 1,
          },
        },
        {
          $match: {
            $and: [
              { year: { $gte: l_year } },
              { year: { $lte: r_year } },
              { metacritic_score: { $gt: 0 } },
            ],
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$converted_date" },
              month: { $month: "$converted_date" },
            },
            avg_score: { $avg: "$metacritic_score" },
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
    timeMetacriticData.sort((a, b) => {
      let a_month = a._id.month;
      let a_year = a._id.year;
      let b_month = b._id.month;
      let b_year = b._id.year;
      if (a_year == b_year) return a_month - b_month;
      else return a_year - b_year;
    });
    timeMetacriticDataNoFilter.sort((a, b) => {
      let a_month = a._id.month;
      let a_year = a._id.year;
      let b_month = b._id.month;
      let b_year = b._id.year;
      if (a_year == b_year) return a_month - b_month;
      else return a_year - b_year;
    });

    let gameCountNoFilter = [
      {
        name: `All Games`,
        data: timeDataNoFilter.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.games_count,
        })),
      },
      {
        name: `${genreFocus} Games`,
        data: timeData.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.games_count,
        })),
      },
    ];

    let gamePriceNoFilter = [
      {
        name: `All Games`,
        data: timeDataNoFilter.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.avg_price,
        })),
      },
      {
        name: `${genreFocus} Games`,
        data: timeData.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.avg_price,
        })),
      },
    ];

    let gameScoreNoFilter = [
      {
        name: `All Games`,
        data: timeMetacriticDataNoFilter.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.avg_score,
        })),
      },
      {
        name: `${genreFocus} Games`,
        data: timeMetacriticData.map((tdata) => ({
          x: `${tdata._id.year}-${tdata._id.month}`,
          y: tdata.avg_score,
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
      gameCountNoFilter: gameCountNoFilter,
      gamePriceNoFilter: gamePriceNoFilter,
      gameScoreNoFilter: gameScoreNoFilter,
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
            short_description: 1,
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
          description: tdata.short_description,
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

    let topGame = ccuData[0].name;
    const topGameFullData = await db
      .collection("games")
      .find({ name: topGame })
      .project({
        name: 1,
        short_description: 1,
        release_date: 1,
        metacritic_score: 1,
        header_image: 1,
        peak_ccu: 1,
      })
      .toArray();

    return {
      topGamesCCU: topGamesCCU,
      topDevsCount: topDevsCount,
      barChartOptions: barChartOptions,
      topGameFullData: JSON.parse(JSON.stringify(topGameFullData))[0],
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
            name: 1,
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
        name: priceData[0].name,
      },
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
