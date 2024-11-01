import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { AutoArrangePlugin } from "rete-auto-arrange-plugin";
import { createRoot } from "react-dom/client";

class Node extends ClassicPreset.Node {
  width = 180;
  height = 150;
}
class Connection<N extends Node> extends ClassicPreset.Connection<N, N> {}

type Schemes = GetSchemes<Node, Connection<Node>>;
type AreaExtra = ReactArea2D<Schemes>;

export async function createEditor(
  container: HTMLElement,
  numberOfNodes: number
) {
  const socket = new ClassicPreset.Socket("socket");

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes, AreaExtra>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });

  render.addPreset(Presets.classic.setup());

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  AreaExtensions.simpleNodesOrder(area);

  const getRandomName = () => Math.random().toString(16);
  const addNode = async (x: number, y: number) => {
    const a = new Node(getRandomName());
    a.addControl(
      "key",
      new ClassicPreset.InputControl("text", {
        initial: getRandomName()
      })
    );
    a.addOutput("key", new ClassicPreset.Output(socket));
    a.addInput("key", new ClassicPreset.Input(socket));
    await editor.addNode(a);

    await area.translate(a.id, { x, y });
    return a;
  };
  const randomPosition = () => ({
    x: Math.random() * 5000,
    y: Math.random() * 5000
  });

  for (let i = 0; i < numberOfNodes / 2; i++) {
    const { x, y } = randomPosition();
    const a = await addNode(x, y);
    const b = await addNode(x + 400, y);

    await editor.addConnection(new Connection(a, "key", b, "key"));
  }

  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy()
  };
}
