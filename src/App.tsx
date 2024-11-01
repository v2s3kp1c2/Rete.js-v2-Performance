import { useCallback, useState } from "react";
import { useRete } from "rete-react-plugin";
import { createEditor } from "./editor";
import styled from "styled-components";

const Input = styled.input`
  border-radius: 1em 0 0 1em;
`;
const Button = styled.button`
  border-radius: 0 1em 1em 0;
  background: #444;
  color: white;
`;
const Hint = styled.p`
  max-width: 20em;
  text-align: center;
  font-size: 0.8em;
  color: #a92;
`;

export default function App() {
  const [inited, setInited] = useState(false);
  const [numberOfNodes, setNumberOfNodes] = useState(100);
  const create = useCallback(
    async (el: HTMLElement) => {
      if (!inited) return { destroy: () => null };
      return createEditor(el, numberOfNodes);
    },
    [inited, numberOfNodes]
  );
  const [ref] = useRete(create);

  return (
    <div className="App">
      {!inited && (
        <div
          style={{
            margin: "40vh auto",
            width: "fit-content"
          }}
        >
          <Input
            value={numberOfNodes}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;

              if (Number.isFinite(+value)) {
                setNumberOfNodes(+value);
              }
            }}
          />
          <Button
            onClick={() => {
              // prevent flushSync warnings in dev mode
              requestAnimationFrame(() => setInited(true));
            }}
          >
            Create nodes
          </Button>
          <Hint>
            <span role="img" aria-label="alert">
              ⚠️
            </span>{" "}
            For more accurate results, either open the application in a separate
            tab or build it for production
          </Hint>
        </div>
      )}
      <div ref={ref} style={{ height: "100vh", width: "100vw" }}></div>
    </div>
  );
}
