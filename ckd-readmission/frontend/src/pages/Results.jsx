import ResultCard from "../components/ResultCard";

export default function Results({ result, onReset }) {
  return (
    <div className="page-results">
      <ResultCard result={result} onReset={onReset} />
    </div>
  );
}
