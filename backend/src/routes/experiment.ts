import { Router } from "express";
import { niftyData } from "../data/niftyData";
import { runBacktest } from "../engine/backtest";

const router = Router();

router.post("/run", (req, res) => {
  try {
    const {
      dropThreshold = 0.02,
      holdingDays = 5,
      transactionCost = 0.001
    } = req.body;

    const result = runBacktest(niftyData, {
      dropThreshold,
      holdingDays,
      transactionCost
    });

    res.json({
      success: true,
      experiment: {
        market: "NIFTY 50",
        condition: `Daily decline >= ${(dropThreshold * 100).toFixed(1)}%`,
        entry: "Next trading day's open",
        exit: `After ${holdingDays} trading days`,
        transactionCost: `${(transactionCost * 100).toFixed(2)}%`
      },
      result
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to run experiment"
    });
  }
});

export default router;