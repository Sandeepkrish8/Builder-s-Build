import EmiCalculator from "./EmiCalculator.jsx";
import CostEstimator from "./CostEstimator.jsx";
import "../common/common.css";
import "./Calculators.css";

export default function Calculators() {
  return (
    <section id="calculators" className="section">
      <div className="section-head">
        <h2>Plan your budget before you visit.</h2>
        <p>A home-loan EMI calculator for apartment buyers and a construction cost estimator for clients building an independent house.</p>
      </div>
      <div className="calc-grid">
        <EmiCalculator />
        <CostEstimator />
      </div>
    </section>
  );
}
