import axios from "axios";
import { z } from "zod";
import { SearchType } from "../types";
import { useMemo, useState } from "react";
// import { object, string, number, Output, parse } from "valibot";

//type guard o assertion
// const isWeatherResponse = (weather: unknown): weather is Weather => {
//   return (
//     Boolean(weather) &&
//     typeof weather === "object" &&
//     typeof (weather as Weather).name === "string" &&
//     typeof (weather as Weather).main.temp === "number" &&
//     typeof (weather as Weather).main.temp_max === "number" &&
//     typeof (weather as Weather).main.temp_min === "number"
//   );
// };
// Zod
const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

export type Weather = z.infer<typeof Weather>;

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};

// Valibot
// const WeatherSchema = object({
//   name: string(),
//   main: object({
//     temp: number(),
//     temp_max: number(),
//     temp_min: number(),
//   }),
// });
// export type Weather = Output<typeof WeatherSchema>;

const useWeather = () => {
  const [weather, setWeather] = useState<Weather>(initialState);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;

      const { data } = await axios.get(geoUrl);

      // Comprobar si existe
      if (!data[0]) {
        setNotFound(true);
        setWeather(initialState);
        return;
      }

      const lat = data[0]?.lat;
      const lon = data[0]?.lon;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;

      //castear el type
      // const { data: weatherResult } = await axios.get<Weather>(weatherUrl);

      //Type Guards
      // const { data: weatherResult } = await axios.get(weatherUrl);

      // const result = isWeatherResponse(weatherResult);

      // Zod
      const { data: weatherResult } = await axios(weatherUrl);
      const result = Weather.safeParse(weatherResult);
      if (result.success) {
        setWeather(result.data);
        setNotFound(false);
      }

      // Valibot
      // const { data: weatherResult } = await axios(weatherUrl);
      // const result = parse(WeatherSchema, weatherResult);
      // if (result) {
      //   setWeather(result)
      // }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return { weather, loading, notFound, fetchWeather, hasWeatherData };
};

export default useWeather;
