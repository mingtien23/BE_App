// updatePasswords.js
import prisma from "./src/common/prisma/init.prisma.js";
import bcrypt from "bcryptjs";

const accountsToUpdate = [
  { userName: "adminThi", plain: "dinhthi1" },
  { userName: "adminSep", plain: "sep1234" },
  { userName: "adminPMO", plain: "leminhtien" },
  { userName: "pmo_mai", plain: "pmo12345" },
  { userName: "pmo_khanh", plain: "pmo12345" },
  { userName: "dt_nhat_mgr", plain: "dt123456" },
  { userName: "dt_han_mgr", plain: "dt123456" },
  { userName: "gv_han_1", plain: "gv123456" },
  { userName: "gv_nhat_1", plain: "gv123456" },
];

const run = async () => {
  console.log("🚀 Starting password update...");

  for (const item of accountsToUpdate) {
    try {
      // 1. Check if user exists
      const exist = await prisma.account.findUnique({
        where: { UserName: item.userName },
      });

      if (!exist) {
        console.log(`❌ User [${item.userName}] not found. Skipped.`);
        continue;
      }

      // 2. Hash password
      const hash = await bcrypt.hash(item.plain, 10);

      // 3. Update DB
      await prisma.account.update({
        where: { UserName: item.userName },
        data: { PassWord: hash },
      });

      console.log(`✅ Updated password for [${item.userName}]`);
    } catch (err) {
      console.error(`ERROR updating [${item.userName}]:`, err);
    }
  }
};

run()
  .then(async () => {
    console.log("DONE ALL.");
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
