import { useState, useEffect } from "react";
import axios from "axios";

export interface ConversionRates {
  [key: string]: number;
}

const useConverter = () => {
  const [usdRate, setUsdRate] = useState<ConversionRates>({});
  const [bnbRate, setBnbRate] = useState<ConversionRates>({});

  useEffect(() => {
    const init = async () => {
      const rates = await getRates(['aptos'], "usd");
      if (rates) setUsdRate(rates);
    };
    init();
  }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     // .filter((t) => t.id != "binancecoin")
  //     const tokens = Tokens.map((t) => t.id);
  //     const rates = await getRates(tokens, "bnb");
  //     if (rates) setBnbRate(rates);
  //   };
  //   init();
  // }, []);

  const getRates = async (tokens: string[], targetCurrency: string) => {
    try {
      const tokenIds = tokens.map((token) => token.toLowerCase()).join(",");
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: tokenIds,
            vs_currencies: targetCurrency,
          },
        }
      );

      const rates = response.data;
      let formattedRates: ConversionRates = {};

      for (const index in tokens) {
        const token = tokens[index];
        formattedRates[token] =
          rates[token.toLowerCase()]?.[targetCurrency] || 0;
      }
      return formattedRates;
    } catch (error) {
      console.error("Error fetching conversion rates:", error);
    }
  };

  return { getRates, usdRate, bnbRate };
};

export default useConverter;
