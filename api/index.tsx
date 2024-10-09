import { Button, Frog, parseEther } from "frog";
import { createSystem } from "frog/ui";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";
import { rootstock, rootstockTestnet, sepolia } from "viem/chains";
import placeBetABI from "../placeBetABI.js";
import { getAddress } from "viem";

const { Image } = createSystem();

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

app.transaction("/placeBetFalse", (c) => {
  console.log("gets false");
  const checksummedAddress = getAddress(
    "0x7f3a5c4E4A33DBbb569B72094da4C40e64129523",
  );

  return c.contract({
    abi: placeBetABI,
    chainId: `eip155:${rootstockTestnet.id}`,
    functionName: "placeBet",
    args: [{ _betOnA: false }],
    to: checksummedAddress, // contract address
    value: parseEther(".004"),
  });
});

app.transaction("/placeBetTrue", (c) => {
  const checksummedAddress = getAddress(
    "0x7f3a5c4E4A33DBbb569B72094da4C40e64129523",
  );
  return c.contract({
    abi: placeBetABI,
    chainId: `eip155:${rootstockTestnet.id}`,
    functionName: "placeBet",
    args: [true],
    to: checksummedAddress, // contract address
    value: parseEther(".004"),
  });
});

app.frame("/betPlaced", (c) => {
  const { transactionId } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Bet Placed Transaction ID: {transactionId}
      </div>
    ),
  });
});

app.frame("/", (c) => {
  const { buttonValue, inputText, status } = c;
  return c.res({
    action: "/betPlaced",
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          <Image src="/h.png" />
        </div>
      </div>
    ),
    intents: [
      <Button.Transaction target="/placeBetFalse">
        Less than cat 4
      </Button.Transaction>,
      <Button.Transaction target="/placeBetTrue">
        Greater than cat 4
      </Button.Transaction>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
