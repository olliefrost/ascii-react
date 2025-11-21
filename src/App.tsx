import AsciiDisplay from "./components/AsciiDisplay";
import EasterEggPage from "./components/EasterEggPage";
import { useSecretCode } from "./hooks/useSecretCode";

function App() {
  const { triggered, reset } = useSecretCode();

  if (triggered) {
    return <EasterEggPage onReturn={reset} />;
  }

  return (
    <div style={{
      background: "black",
      minHeight: "100vh",
      width: "100vw",
      padding: "0",
      margin: "0",
      color: "white",
      overflow: "hidden",
    }}>
      <AsciiDisplay imageSrc="/test.jpg" />
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.12em",
        opacity: 0.85,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        © 2025 Frost
      </div>
    </div>
  );
}

export default App;
