import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  FlaskConical,
  Gauge,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Target,
  TestTube2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Stage = "ask" | "clarify" | "define" | "test" | "learn";

interface Trade {
  signalDate: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  grossReturn: number;
  netReturn: number;
  winning: boolean;
}

interface ExperimentResult {
  signals: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageReturn: number;
  medianReturn: number;
  bestTrade: number;
  worstTrade: number;
  averageReturnAfterCosts: number;
  trades: Trade[];
}

interface ExperimentResponse {
  success: boolean;
  experiment: {
    market: string;
    condition: string;
    entry: string;
    exit: string;
    transactionCost: string;
  };
  result: ExperimentResult;
}

const stages: {
  id: Stage;
  label: string;
  description: string;
}[] = [
  {
    id: "ask",
    label: "Ask",
    description: "Research question",
  },
  {
    id: "clarify",
    label: "Clarify",
    description: "Expose assumptions",
  },
  {
    id: "define",
    label: "Define",
    description: "Build experiment",
  },
  {
    id: "test",
    label: "Test",
    description: "Run evidence",
  },
  {
    id: "learn",
    label: "Learn",
    description: "Interpret results",
  },
];

function App() {
  const [stage, setStage] = useState<Stage>("ask");

  const [question, setQuestion] = useState(
    "Does buying NIFTY after a sharp fall work?"
  );

  const [dropThreshold, setDropThreshold] = useState(2);
  const [holdingDays, setHoldingDays] = useState(5);
  const [transactionCost, setTransactionCost] = useState(0.1);

  const [results, setResults] =
    useState<ExperimentResult | null>(null);

  const [baselineResults, setBaselineResults] =
    useState<ExperimentResult | null>(null);

  const [hasSensitivityRun, setHasSensitivityRun] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sensitivityLoading, setSensitivityLoading] =
    useState("");

  const currentIndex = stages.findIndex(
    (item) => item.id === stage
  );

  const runExperiment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/experiment/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dropThreshold: dropThreshold / 100,
            holdingDays,
            transactionCost: transactionCost / 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data: ExperimentResponse =
        await response.json();

      if (!data.success) {
        throw new Error("Experiment failed");
      }

      setResults(data.result);
      setBaselineResults(data.result);
      setHasSensitivityRun(false);
      setStage("test");
    } catch {
      setError(
        "Research engine unavailable. Make sure your backend is running on port 5001."
      );
    } finally {
      setLoading(false);
    }
  };

  const runSensitivity = async (
    type: "threshold" | "holding",
    value: number
  ) => {
    setSensitivityLoading(`${type}-${value}`);
    setError("");

    const nextDropThreshold =
      type === "threshold" ? value : dropThreshold;

    const nextHoldingDays =
      type === "holding" ? value : holdingDays;

    try {
      const response = await fetch(
        "http://localhost:5001/api/experiment/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dropThreshold: nextDropThreshold / 100,
            holdingDays: nextHoldingDays,
            transactionCost: transactionCost / 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Sensitivity request failed");
      }

      const data: ExperimentResponse =
        await response.json();

      if (!data.success) {
        throw new Error("Sensitivity experiment failed");
      }

      if (type === "threshold") {
        setDropThreshold(value);
      }

      if (type === "holding") {
        setHoldingDays(value);
      }

      setResults(data.result);
      setHasSensitivityRun(true);
      setStage("test");
    } catch {
      setError(
        "Unable to run sensitivity test. Make sure your backend is running on port 5001."
      );
    } finally {
      setSensitivityLoading("");
    }
  };

  const handleNext = () => {
    if (stage === "ask") {
      setStage("clarify");
      return;
    }

    if (stage === "clarify") {
      setStage("define");
      return;
    }

    if (stage === "define") {
      runExperiment();
      return;
    }

    if (stage === "test") {
      setStage("learn");
    }
  };

  return (
    <div className="research-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-box">RP</div>

          <div className="logo-copy">
            <div className="logo-title">
              ResearchPilot
            </div>

            <div className="logo-caption">
              AI-NATIVE MARKET RESEARCH
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="market-indicator">
            <span className="live-dot" />
            Research Engine

            <span className="online-text">
              ONLINE
            </span>
          </div>
        </div>

        <div className="header-right">
          <span className="dataset-pill">
            SYNTHETIC DATA
          </span>

          <div className="avatar">N</div>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-section-label">
            RESEARCH FLOW
          </div>

          <nav className="stage-nav">
            {stages.map((item, index) => {
              const active = item.id === stage;

              const completed =
                index < currentIndex;

              return (
                <button
                  key={item.id}
                  className={`stage-nav-item ${
                    active ? "active" : ""
                  } ${completed ? "completed" : ""}`}
                  onClick={() => {
                    if (index <= currentIndex) {
                      setStage(item.id);
                    }
                  }}
                >
                  <div className="stage-marker">
                    {completed ? (
                      <Check size={12} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="stage-nav-copy">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>

                  {active && (
                    <ChevronRight
                      size={14}
                      className="active-arrow"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-divider" />

          <div className="sidebar-section-label">
            CURRENT RESEARCH
          </div>

          <div className="sidebar-question">
            <div className="sidebar-question-icon">
              <Brain size={14} />
            </div>

            <p>{question}</p>
          </div>

          <div className="sidebar-bottom">
            <div className="research-engine-card">
              <div className="engine-icon">
                <Sparkles size={14} />
              </div>

              <div>
                <strong>ResearchPilot</strong>

                <span>
                  Reasoning before conclusions.
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="workspace">
          {stage === "ask" && (
            <AskView
              question={question}
              setQuestion={setQuestion}
              onNext={handleNext}
            />
          )}

          {stage === "clarify" && (
            <ClarifyView
              dropThreshold={dropThreshold}
              holdingDays={holdingDays}
              transactionCost={transactionCost}
              setDropThreshold={setDropThreshold}
              setHoldingDays={setHoldingDays}
              setTransactionCost={setTransactionCost}
              onNext={handleNext}
            />
          )}

          {stage === "define" && (
            <DefineView
              dropThreshold={dropThreshold}
              holdingDays={holdingDays}
              transactionCost={transactionCost}
              onRun={handleNext}
              loading={loading}
              error={error}
            />
          )}

          {stage === "test" && (
            <TestView
              results={results}
              baselineResults={baselineResults}
              hasSensitivityRun={hasSensitivityRun}
              dropThreshold={dropThreshold}
              holdingDays={holdingDays}
              transactionCost={transactionCost}
              onNext={handleNext}
              onBack={() => setStage("define")}
              onRunSensitivity={runSensitivity}
              sensitivityLoading={sensitivityLoading}
              error={error}
            />
          )}

          {stage === "learn" && (
            <LearnView
              results={results}
              onBack={() => setStage("test")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   ASK
========================================================= */

function AskView({
  question,
  setQuestion,
  onNext,
}: {
  question: string;
  setQuestion: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <WorkspaceLayout
      eyebrow="01 / ASK"
      icon={<CircleHelp size={16} />}
      title="Start with the question."
      subtitle="Turn a market intuition into a question that can be tested."
    >
      <div className="ask-container">
        <div className="question-card">
          <div className="question-card-top">
            <div>
              <span className="micro-label">
                RESEARCH QUESTION
              </span>

              <div className="question-status">
                <span className="status-ring" />
                Ready for clarification
              </div>
            </div>

            <span className="question-index">
              QUERY / 01
            </span>
          </div>

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            className="large-question"
            rows={4}
            placeholder="Enter a research question..."
          />

          <div className="question-card-bottom">
            <span>
              Be specific enough that the question can become
              an experiment.
            </span>

            <button
              className="black-button"
              disabled={!question.trim()}
              onClick={onNext}
            >
              Clarify question
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="ask-insights">
          <div className="section-heading">
            <span>HOW RESEARCHPILOT THINKS</span>
          </div>

          <div className="insight-row">
            <div className="insight-number">01</div>

            <div>
              <strong>Challenge ambiguity</strong>

              <p>
                Terms such as “sharp fall” need a measurable
                definition.
              </p>
            </div>
          </div>

          <div className="insight-row">
            <div className="insight-number">02</div>

            <div>
              <strong>Make assumptions explicit</strong>

              <p>
                Entry, exit, holding period and costs affect
                the answer.
              </p>
            </div>
          </div>

          <div className="insight-row">
            <div className="insight-number">03</div>

            <div>
              <strong>Separate evidence from belief</strong>

              <p>
                A backtest result is not automatically a
                trading conclusion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

/* =========================================================
   CLARIFY
========================================================= */

function ClarifyView({
  dropThreshold,
  holdingDays,
  transactionCost,
  setDropThreshold,
  setHoldingDays,
  setTransactionCost,
  onNext,
}: {
  dropThreshold: number;
  holdingDays: number;
  transactionCost: number;
  setDropThreshold: (value: number) => void;
  setHoldingDays: (value: number) => void;
  setTransactionCost: (value: number) => void;
  onNext: () => void;
}) {
  return (
    <WorkspaceLayout
      eyebrow="02 / CLARIFY"
      icon={<SlidersHorizontal size={16} />}
      title="Make the assumptions visible."
      subtitle="The question is useful. But several important decisions are still undefined."
    >
      <div className="clarify-grid">
        <ResearchControl
          number="01"
          title="What is a sharp fall?"
          description="Define the minimum daily decline that triggers a signal."
          icon={<TrendingDown size={16} />}
        >
          <select
            value={dropThreshold}
            onChange={(event) =>
              setDropThreshold(
                Number(event.target.value)
              )
            }
            className="research-select"
          >
            <option value={1.5}>
              ≥ 1.5% daily decline
            </option>

            <option value={2}>
              ≥ 2.0% daily decline
            </option>

            <option value={2.5}>
              ≥ 2.5% daily decline
            </option>

            <option value={3}>
              ≥ 3.0% daily decline
            </option>
          </select>
        </ResearchControl>

        <ResearchControl
          number="02"
          title="What does “works” mean?"
          description="Choose how long we hold the position after the signal."
          icon={<Gauge size={16} />}
        >
          <select
            value={holdingDays}
            onChange={(event) =>
              setHoldingDays(
                Number(event.target.value)
              )
            }
            className="research-select"
          >
            <option value={1}>
              1 trading day
            </option>

            <option value={3}>
              3 trading days
            </option>

            <option value={5}>
              5 trading days
            </option>

            <option value={10}>
              10 trading days
            </option>
          </select>
        </ResearchControl>

        <ResearchControl
          number="03"
          title="What about costs?"
          description="Account for the friction involved in executing the strategy."
          icon={<BarChart3 size={16} />}
        >
          <select
            value={transactionCost}
            onChange={(event) =>
              setTransactionCost(
                Number(event.target.value)
              )
            }
            className="research-select"
          >
            <option value={0}>
              0.00% round trip
            </option>

            <option value={0.05}>
              0.05% round trip
            </option>

            <option value={0.1}>
              0.10% round trip
            </option>

            <option value={0.2}>
              0.20% round trip
            </option>
          </select>
        </ResearchControl>
      </div>

      <div className="research-note">
        <Lightbulb size={15} />

        <div>
          <strong>Why this matters</strong>

          <span>
            Different assumptions can produce different
            conclusions. ResearchPilot keeps them editable
            instead of hiding them inside the model.
          </span>
        </div>
      </div>

      <WorkspaceAction
        label="Build experiment"
        onClick={onNext}
      />
    </WorkspaceLayout>
  );
}

/* =========================================================
   DEFINE
========================================================= */

function DefineView({
  dropThreshold,
  holdingDays,
  transactionCost,
  onRun,
  loading,
  error,
}: {
  dropThreshold: number;
  holdingDays: number;
  transactionCost: number;
  onRun: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <WorkspaceLayout
      eyebrow="03 / DEFINE"
      icon={<FlaskConical size={16} />}
      title="Build the experiment."
      subtitle="Every part of the rule is explicit before we run it."
    >
      <div className="define-layout">
        <div className="experiment-panel">
          <div className="panel-header">
            <div>
              <span className="micro-label">
                EXPERIMENT SPECIFICATION
              </span>

              <h2>
                Sharp-fall mean reversion
              </h2>
            </div>

            <div className="experiment-number">
              EXP / 001
            </div>
          </div>

          <div className="definition-list">
            <Definition
              label="MARKET"
              value="NIFTY 50"
            />

            <Definition
              label="SIGNAL"
              value={`Daily decline ≥ ${dropThreshold.toFixed(
                1
              )}%`}
            />

            <Definition
              label="ENTRY"
              value="Next trading day's open"
            />

            <Definition
              label="HOLD"
              value={`${holdingDays} trading day${
                holdingDays === 1 ? "" : "s"
              }`}
            />

            <Definition
              label="EXIT"
              value="Holding-period close"
            />

            <Definition
              label="COST"
              value={`${transactionCost.toFixed(
                2
              )}% round trip`}
            />
          </div>
        </div>

        <div className="method-panel">
          <div className="method-icon">
            <Target size={17} />
          </div>

          <span className="micro-label">
            RESEARCH METHOD
          </span>

          <h3>
            Test the rule mechanically.
          </h3>

          <p>
            The engine scans the dataset for qualifying
            declines, enters at the next open, holds for the
            chosen period and measures the resulting return.
          </p>

          <div className="method-divider" />

          <div className="method-check">
            <Check size={13} />
            No future prices used for entry
          </div>

          <div className="method-check">
            <Check size={13} />
            Transaction costs included
          </div>

          <div className="method-check">
            <Check size={13} />
            Rule is deterministic
          </div>
        </div>
      </div>

      <div className="data-warning">
        <ShieldAlert size={16} />

        <div>
          <strong>
            Synthetic demonstration dataset
          </strong>

          <span>
            This prototype uses deliberately constructed demo
            data. Results validate the research workflow and
            engine, not actual NIFTY performance.
          </span>
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <WorkspaceAction
        label={
          loading
            ? "Running experiment..."
            : "Run experiment"
        }
        icon={
          loading ? undefined : <Play size={14} />
        }
        onClick={onRun}
        disabled={loading}
      />
    </WorkspaceLayout>
  );
}

/* =========================================================
   TEST
========================================================= */

function TestView({
  results,
  baselineResults,
  hasSensitivityRun,
  dropThreshold,
  holdingDays,
  transactionCost,
  onNext,
  onBack,
  onRunSensitivity,
  sensitivityLoading,
  error,
}: {
  results: ExperimentResult | null;
  baselineResults: ExperimentResult | null;
  hasSensitivityRun: boolean;
  dropThreshold: number;
  holdingDays: number;
  transactionCost: number;
  onNext: () => void;
  onBack: () => void;
  onRunSensitivity: (
    type: "threshold" | "holding",
    value: number
  ) => void;
  sensitivityLoading: string;
  error: string;
}) {
  if (!results) {
    return (
      <WorkspaceLayout
        eyebrow="04 / TEST"
        icon={<TestTube2 size={16} />}
        title="Run the experiment first."
        subtitle="No experiment result is available yet."
      >
        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to definition
        </button>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout
      eyebrow="04 / TEST"
      icon={<TestTube2 size={16} />}
      title="See what happened."
      subtitle="The rule has now been applied mechanically to the demonstration dataset."
    >
      <div className="result-alert">
        <div className="alert-icon">
          <ShieldAlert size={15} />
        </div>

        <div>
          <strong>Interpret with caution</strong>

          <span>
            100% win rate here is a property of this synthetic
            demonstration dataset, not evidence of a real
            trading edge.
          </span>
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="metric-grid">
        <ResultMetric
          label="TESTED SIGNALS"
          value={results.signals.toString()}
          icon={<Target size={15} />}
        />

        <ResultMetric
          label="WIN RATE"
          value={`${(
            results.winRate * 100
          ).toFixed(0)}%`}
          icon={<TrendingUp size={15} />}
          positive
        />

        <ResultMetric
          label="AVG GROSS RETURN"
          value={formatSignedPercent(
            results.averageReturn
          )}
          icon={<BarChart3 size={15} />}
          positive
        />

        <ResultMetric
          label="AVG AFTER COSTS"
          value={formatSignedPercent(
            results.averageReturnAfterCosts
          )}
          icon={<Gauge size={15} />}
          positive
        />
      </div>

      {hasSensitivityRun &&
        baselineResults && (
          <ScenarioComparison
            baseline={baselineResults}
            current={results}
          />
        )}

      <div className="test-grid">
        <div className="performance-panel">
          <div className="panel-header compact">
            <div>
              <span className="micro-label">
                PERFORMANCE
              </span>

              <h2>Trade outcomes</h2>
            </div>

            <span className="neutral-pill">
              {results.trades.length} trades
            </span>
          </div>

          <PerformanceChart trades={results.trades} />

          <div className="performance-summary">
            <div>
              <span>BEST</span>

              <strong
                className={
                  results.bestTrade >= 0
                    ? "return-positive"
                    : "return-negative"
                }
              >
                {formatSignedPercent(
                  results.bestTrade
                )}
              </strong>
            </div>

            <div>
              <span>MEDIAN</span>

              <strong
                className={
                  results.medianReturn >= 0
                    ? "return-positive"
                    : "return-negative"
                }
              >
                {formatSignedPercent(
                  results.medianReturn
                )}
              </strong>
            </div>

            <div>
              <span>WORST</span>

              <strong
                className={
                  results.worstTrade >= 0
                    ? "return-positive"
                    : "return-negative"
                }
              >
                {formatSignedPercent(
                  results.worstTrade
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="experiment-summary">
          <div className="panel-header compact">
            <div>
              <span className="micro-label">
                EXPERIMENT
              </span>

              <h2>Current rule</h2>
            </div>

            <FlaskConical size={16} />
          </div>

          <div className="rule-list">
            <RuleRow
              label="Market"
              value="NIFTY 50"
            />

            <RuleRow
              label="Sharp fall"
              value={`≥ ${dropThreshold.toFixed(
                1
              )}%`}
            />

            <RuleRow
              label="Entry"
              value="Next open"
            />

            <RuleRow
              label="Holding"
              value={`${holdingDays} days`}
            />

            <RuleRow
              label="Cost"
              value={`${transactionCost.toFixed(
                2
              )}%`}
            />
          </div>

          <div className="summary-callout">
            <Lightbulb size={14} />

            <span>
              The next question is whether this result
              survives changes to these assumptions.
            </span>
          </div>
        </div>
      </div>

      <div
        className={`sensitivity-panel ${
          sensitivityLoading
            ? "sensitivity-panel-running"
            : ""
        }`}
      >
        <div className="panel-header sensitivity-top">
          <div>
            <span className="micro-label">
              ROBUSTNESS CHECK
            </span>

            <h2>Sensitivity analysis</h2>
          </div>

          <span className="neutral-pill">
            ASSUMPTION TEST
          </span>
        </div>

        <p className="sensitivity-description">
          Test whether the headline result survives reasonable
          changes to the assumptions. Each test runs the same
          backtest engine with only the selected parameter changed.
        </p>

        <div className="sensitivity-controls">
          <SensitivityGroup
            title="DROP THRESHOLD"
            subtitle="Definition of “sharp fall”"
            values={[
              { label: "1.5%", value: 1.5 },
              { label: "2.0%", value: 2 },
              { label: "2.5%", value: 2.5 },
              { label: "3.0%", value: 3 },
            ]}
            current={`${dropThreshold.toFixed(1)}%`}
            onSelect={(value) =>
              onRunSensitivity("threshold", value)
            }
            loading={sensitivityLoading}
          />

          <SensitivityGroup
            title="HOLDING PERIOD"
            subtitle="How long the rebound is measured"
            values={[
              { label: "1 day", value: 1 },
              { label: "3 days", value: 3 },
              { label: "5 days", value: 5 },
              { label: "10 days", value: 10 },
            ]}
            current={`${holdingDays} day${
              holdingDays === 1 ? "" : "s"
            }`}
            onSelect={(value) =>
              onRunSensitivity("holding", value)
            }
            loading={sensitivityLoading}
          />
        </div>

        {sensitivityLoading && (
          <div className="sensitivity-running">
            <span className="sensitivity-spinner" />

            <span>
              Running robustness check — updating the current
              scenario...
            </span>
          </div>
        )}
      </div>

      <div className="trade-table-panel">
        <div className="panel-header compact">
          <div>
            <span className="micro-label">
              TRADE LEDGER
            </span>

            <h2>Individual outcomes</h2>
          </div>

          <span className="neutral-pill">
            {results.trades.length} OBSERVATIONS
          </span>
        </div>

        <div className="table-scroll">
          <table className="trade-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Net Return</th>
              </tr>
            </thead>

            <tbody>
              {results.trades.map((trade, index) => (
                <tr
                  key={`${trade.signalDate}-${trade.entryDate}-${index}`}
                >
                  <td>{trade.signalDate}</td>
                  <td>{trade.entryDate}</td>
                  <td>{trade.exitDate}</td>

                  <td>
                    {trade.entryPrice.toLocaleString()}
                  </td>

                  <td>
                    {trade.exitPrice.toLocaleString()}
                  </td>

                  <td
                    className={
                      trade.netReturn >= 0
                        ? "return-positive"
                        : "return-negative"
                    }
                  >
                    {formatSignedPercent(
                      trade.netReturn
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="workspace-actions dual">
        <button
          className="secondary-button"
          onClick={onBack}
        >
          <RotateCcw size={14} />
          Change assumptions
        </button>

        <button
          className="black-button"
          onClick={onNext}
        >
          Interpret results
          <ArrowRight size={14} />
        </button>
      </div>
    </WorkspaceLayout>
  );
}

/* =========================================================
   PERFORMANCE CHART
========================================================= */

function PerformanceChart({
  trades,
}: {
  trades: Trade[];
}) {
  const maxAbsReturn = Math.max(
    ...trades.map((trade) =>
      Math.abs(trade.netReturn)
    ),
    0.01
  );

  const chartScale = Math.min(
    Math.max(maxAbsReturn * 100, 2),
    5
  );

  return (
    <div className="performance-chart">
      <div className="chart-y-label top">
        +{chartScale.toFixed(0)}%
      </div>

      <div className="chart-y-label middle">
        0%
      </div>

      <div className="chart-y-label bottom">
        -{chartScale.toFixed(0)}%
      </div>

      <div className="chart-grid-line chart-positive-line" />
      <div className="chart-zero-line" />
      <div className="chart-grid-line chart-negative-line" />

      <div className="chart-bars">
        {trades.map((trade, index) => {
          const percentage =
            Math.abs(trade.netReturn) * 100;

          const height = Math.min(
            88,
            Math.max(
              8,
              (percentage / chartScale) * 42
            )
          );

          const positive =
            trade.netReturn >= 0;

          return (
            <div
              className={`chart-column ${
                positive ? "positive" : "negative"
              }`}
              key={`${trade.signalDate}-${index}`}
              title={`Trade ${index + 1}: ${formatSignedPercent(
                trade.netReturn
              )}`}
            >
              <div className="chart-value">
                {formatSignedPercent(
                  trade.netReturn
                )}
              </div>

              <div
                className={`chart-bar ${
                  positive
                    ? "chart-bar-positive"
                    : "chart-bar-negative"
                }`}
                style={{
                  height: `${height}%`,
                }}
              />

              <span>T{index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SCENARIO COMPARISON
========================================================= */

function ScenarioComparison({
  baseline,
  current,
}: {
  baseline: ExperimentResult;
  current: ExperimentResult;
}) {
  const returnDelta =
    current.averageReturnAfterCosts -
    baseline.averageReturnAfterCosts;

  const winRateDelta =
    current.winRate - baseline.winRate;

  const signalDelta =
    current.signals - baseline.signals;

  let status:
    | "ROBUST"
    | "CHANGED"
    | "WEAKENED";

  if (
    returnDelta < -0.002 ||
    winRateDelta < -0.1
  ) {
    status = "WEAKENED";
  } else if (
    Math.abs(returnDelta) <= 0.002 &&
    Math.abs(winRateDelta) <= 0.05
  ) {
    status = "ROBUST";
  } else {
    status = "CHANGED";
  }

  const statusDescription =
    status === "ROBUST"
      ? "The headline result remains broadly stable under the changed assumption."
      : status === "WEAKENED"
      ? "The result deteriorates under this assumption, reducing confidence in the original finding."
      : "The result changes meaningfully under this assumption and deserves further testing.";

  return (
    <div className="scenario-comparison">
      <div className="scenario-header">
        <div>
          <span className="micro-label">
            BASELINE → CURRENT SCENARIO
          </span>

          <h2>
            Did the result survive the change?
          </h2>
        </div>

        <div
          className={`robustness-badge ${status.toLowerCase()}`}
        >
          {status}
        </div>
      </div>

      <div className="scenario-description">
        <span>{statusDescription}</span>
      </div>

      <div className="scenario-grid">
        <ScenarioMetric
          label="AVG AFTER COSTS"
          baseline={
            baseline.averageReturnAfterCosts
          }
          current={
            current.averageReturnAfterCosts
          }
          formatter={formatSignedPercent}
          deltaFormatter={
            formatSignedPercentagePoint
          }
        />

        <ScenarioMetric
          label="WIN RATE"
          baseline={baseline.winRate}
          current={current.winRate}
          formatter={(value) =>
            `${(value * 100).toFixed(0)}%`
          }
          deltaFormatter={
            formatSignedWinRateDelta
          }
        />

        <ScenarioMetric
          label="TESTED SIGNALS"
          baseline={baseline.signals}
          current={current.signals}
          formatter={(value) =>
            value.toString()
          }
          deltaFormatter={(value) =>
            `${value > 0 ? "+" : ""}${value}`
          }
        />
      </div>

      <div className="scenario-footnote">
        <ShieldAlert size={12} />

        <span>
          Robustness status is a simple decision aid, not a
          statistical significance test.
        </span>
      </div>
    </div>
  );
}

function ScenarioMetric({
  label,
  baseline,
  current,
  formatter,
  deltaFormatter,
}: {
  label: string;
  baseline: number;
  current: number;
  formatter: (value: number) => string;
  deltaFormatter: (value: number) => string;
}) {
  const delta = current - baseline;

  const deltaClass =
    delta > 0
      ? "delta-positive"
      : delta < 0
      ? "delta-negative"
      : "delta-neutral";

  return (
    <div className="scenario-metric">
      <span>{label}</span>

      <div className="scenario-values">
        <div>
          <small>BASELINE</small>

          <strong>
            {formatter(baseline)}
          </strong>
        </div>

        <ArrowRight size={13} />

        <div>
          <small>CURRENT</small>

          <strong>
            {formatter(current)}
          </strong>
        </div>
      </div>

      <div
        className={`scenario-delta ${deltaClass}`}
      >
        {deltaFormatter(delta)}
      </div>
    </div>
  );
}

/* =========================================================
   LEARN
========================================================= */

function LearnView({
  results,
  onBack,
}: {
  results: ExperimentResult | null;
  onBack: () => void;
}) {
  return (
    <WorkspaceLayout
      eyebrow="05 / LEARN"
      icon={<Lightbulb size={16} />}
      title="Now separate evidence from conclusion."
      subtitle="The goal is not to force an answer. It is to understand what the experiment actually tells us."
    >
      <div className="learning-grid">
        <LearningPanel
          number="01"
          label="OBSERVATION"
          title="What the data shows"
          icon={<BarChart3 size={16} />}
        >
          {results ? (
            <p>
              The current synthetic experiment produced{" "}
              <strong>
                {results.winningTrades} winning trades
              </strong>{" "}
              from {results.signals} tested signals, with an
              average gross return of{" "}
              <strong>
                {formatSignedPercent(
                  results.averageReturn
                )}
              </strong>
              .
            </p>
          ) : (
            <p>No experiment has been run.</p>
          )}
        </LearningPanel>

        <LearningPanel
          number="02"
          label="INTERPRETATION"
          title="What it might mean"
          icon={<Brain size={16} />}
        >
          <p>
            The demonstration data was intentionally created
            with post-fall recoveries. Therefore, the strong
            result is expected and mainly validates that the
            research engine is working.
          </p>
        </LearningPanel>

        <LearningPanel
          number="03"
          label="CONCLUSION"
          title="What we can conclude"
          icon={<ShieldAlert size={16} />}
        >
          <p>
            We cannot conclude that buying NIFTY after a sharp
            fall works in real markets. Real historical data,
            robustness testing and out-of-sample validation are
            still required.
          </p>
        </LearningPanel>
      </div>

      <div className="next-research-panel">
        <div className="panel-header">
          <div>
            <span className="micro-label">
              NEXT RESEARCH QUESTIONS
            </span>

            <h2>Where should we go next?</h2>
          </div>

          <Sparkles size={17} />
        </div>

        <div className="research-question-list">
          <ResearchQuestion
            number="01"
            text="Does the effect survive different sharp-fall thresholds?"
          />

          <ResearchQuestion
            number="02"
            text="Does the effect change across bull and bear regimes?"
          />

          <ResearchQuestion
            number="03"
            text="Which holding period gives the most stable result?"
          />

          <ResearchQuestion
            number="04"
            text="How sensitive is the result to costs and slippage?"
          />

          <ResearchQuestion
            number="05"
            text="Does the effect survive unseen out-of-sample data?"
          />
        </div>
      </div>

      <div className="workspace-actions">
        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to experiment
        </button>
      </div>
    </WorkspaceLayout>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function WorkspaceLayout({
  eyebrow,
  icon,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="workspace-content">
      <div className="page-heading">
        <div className="page-icon">
          {icon}
        </div>

        <div>
          <div className="page-eyebrow">
            {eyebrow}
          </div>

          <h1>{title}</h1>

          <p>{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function ResearchControl({
  number,
  title,
  description,
  icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="research-control">
      <div className="control-top">
        <div className="control-number">
          {number}
        </div>

        <div className="control-icon">
          {icon}
        </div>
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

      <div className="control-input">
        {children}
      </div>
    </div>
  );
}

function Definition({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="definition-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RuleRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rule-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  icon,
  positive = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="result-metric">
      <div className="metric-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong className={positive ? "metric-positive" : ""}>
        {value}
      </strong>
    </div>
  );
}

function SensitivityGroup({
  title,
  subtitle,
  values,
  current,
  onSelect,
  loading,
}: {
  title: string;
  subtitle: string;
  values: { label: string; value: number }[];
  current: string;
  onSelect: (value: number) => void;
  loading: string;
}) {
  const type =
    title === "DROP THRESHOLD"
      ? "threshold"
      : "holding";

  return (
    <div className="sensitivity-group">
      <div className="sensitivity-heading">
        <div>
          <span>{title}</span>

          <small>{subtitle}</small>
        </div>
      </div>

      <div className="sensitivity-values">
        {values.map((item) => {
          const selected =
            item.label === current;

          const isLoading =
            loading === `${type}-${item.value}`;

          return (
            <button
              type="button"
              key={`${title}-${item.value}`}
              className={`sensitivity-option ${
                selected ? "selected" : ""
              } ${isLoading ? "loading" : ""}`}
              onClick={() => onSelect(item.value)}
              disabled={Boolean(loading)}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="sensitivity-spinner" />
              ) : (
                <>
                  {item.label}

                  {selected && (
                    <Check size={11} />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LearningPanel({
  number,
  label,
  title,
  icon,
  children,
}: {
  number: string;
  label: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="learning-panel">
      <div className="learning-panel-top">
        <span>{number}</span>

        <div className="learning-panel-icon">
          {icon}
        </div>
      </div>

      <div className="micro-label">
        {label}
      </div>

      <h2>{title}</h2>

      <div className="learning-text">
        {children}
      </div>
    </article>
  );
}

function ResearchQuestion({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="research-question">
      <span>{number}</span>

      <p>{text}</p>

      <ArrowRight size={14} />
    </div>
  );
}

function WorkspaceAction({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="workspace-actions">
      <button
        className="black-button"
        onClick={onClick}
        disabled={disabled}
      >
        {label}

        {icon || <ArrowRight size={14} />}
      </button>
    </div>
  );
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatSignedPercent(value: number) {
  const percentage = value * 100;

  if (Math.abs(percentage) < 0.005) {
    return "0.00%";
  }

  if (percentage > 0) {
    return `+${percentage.toFixed(2)}%`;
  }

  return `${percentage.toFixed(2)}%`;
}

function formatSignedPercentagePoint(value: number) {
  const percentage = value * 100;

  if (Math.abs(percentage) < 0.005) {
    return "0.00 pp";
  }

  if (percentage > 0) {
    return `+${percentage.toFixed(2)} pp`;
  }

  return `${percentage.toFixed(2)} pp`;
}

function formatSignedWinRateDelta(value: number) {
  const percentage = value * 100;

  if (Math.abs(percentage) < 0.5) {
    return "0 pp";
  }

  if (percentage > 0) {
    return `+${percentage.toFixed(0)} pp`;
  }

  return `${percentage.toFixed(0)} pp`;
}

export default App;