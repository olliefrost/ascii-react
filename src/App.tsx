import AsciiDisplay from "./components/AsciiDisplay";

function App() {
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
    </div>
  );
}

export default App;
