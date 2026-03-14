const migrateDjRecords = async () => {
  try {
    console.log("🚀 Starting DJ Vault Migration...");

    const result = await Dj.updateMany(
      {
        $or: [
          { setPlacement: { $exists: false } },
          { energyLevel: { $exists: false } },
          { bankName: { $exists: false } },
          { accountHolder: { $exists: false } },
          { accountNumber: { $exists: false } },
        ],
      },
      {
        $set: {
          setPlacement: [],
          energyLevel: "Mid Energy (Head-bobbing)", // Default middle-ground
          bankName: "",
          accountHolder: "",
          accountNumber: "",
        },
      },
    );

    console.log(
      `✅ Migration Complete. Updated ${result.modifiedCount} records.`,
    );
  } catch (error) {
    console.error("❌ Migration Failed:", error);
  }
};

migrateDjRecords();
