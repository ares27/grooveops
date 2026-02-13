// src/data/dummyDjs.ts
export const dummyDjs = [
  {
    id: "1",
    name: "Alex Phase",
    genre: "Techno",
    fee: 250,
    energy: "Peak",
    contact: "alex@dj.com",
    payment: "PayPal: alexphase",
  },
  {
    id: "2",
    name: "Sarah Drift",
    genre: "House",
    fee: 200,
    energy: "Opening",
    contact: "sarah@dj.com",
    payment: "IBAN: DE1234...",
  },
  {
    id: "3",
    name: "DJ Pulse",
    genre: "Drum & Bass",
    fee: 300,
    energy: "Closing",
    contact: "pulse@dj.com",
    payment: "Revolut: @pulse",
  },
  {
    id: "4",
    name: "Mina Low",
    genre: "Deep House",
    fee: 150,
    energy: "Warmup",
    contact: "mina@dj.com",
    payment: "PayPal: minalow",
  },
  {
    id: "5",
    name: "Mote",
    genre: "Techno",
    fee: 400,
    energy: "Peak",
    contact: "mote@dj.com",
    payment: "IBAN: GB5678...",
  },
  {
    id: "6",
    name: "Solaris",
    genre: "Trance",
    fee: 220,
    energy: "Peak",
    contact: "sol@dj.com",
    payment: "PayPal: solaris",
  },
  {
    id: "7",
    name: "Luna B",
    genre: "Garage",
    fee: 180,
    energy: "Warmup",
    contact: "luna@dj.com",
    payment: "Revolut: @lunab",
  },
  {
    id: "8",
    name: "Vortex",
    genre: "Hardstyle",
    fee: 350,
    energy: "Closing",
    contact: "v@dj.com",
    payment: "PayPal: vortex",
  },
  {
    id: "9",
    name: "Jade",
    genre: "Minimal",
    fee: 175,
    energy: "Opening",
    contact: "jade@dj.com",
    payment: "IBAN: FR9012...",
  },
  {
    id: "10",
    name: "Echo",
    genre: "Ambient",
    fee: 100,
    energy: "Warmup",
    contact: "echo@dj.com",
    payment: "PayPal: echo",
  },
];

export const initVault = () => {
  if (!localStorage.getItem("dj_vault")) {
    localStorage.setItem("dj_vault", JSON.stringify(dummyDjs));
  }
};
