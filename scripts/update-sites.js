const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateSites() {
  try {
    // すべての現場のunitPayConditionを"normal"に設定
    const updatedSites = await prisma.site.updateMany({
      where: {
        unitPayCondition: "",
      },
      data: {
        unitPayCondition: "normal",
      },
    });

    console.log(`${updatedSites.count}件の現場を更新しました`);
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSites();
