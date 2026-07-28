import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({
      include: { user: true, studentFees: true }
    });
    const feeType = await prisma.feeType.findFirst({
        where: { isVariable: true }
    });
    const optedVariableFeeIds = [feeType.id];
    const schoolId = student.schoolId;

    try {
        await prisma.$transaction(async (tx) => {
            const structures = await tx.feeStructure.findMany({
                where: { schoolId, class: student.class },
                include: { feeType: true }
            });
            const validOptedStructures = structures.filter(st => 
                st.feeType.isVariable && optedVariableFeeIds.includes(st.feeType.id)
            );
            for (const st of validOptedStructures) {
                const exists = student.studentFees.find(f => f.feeStructureId === st.id);
                if (!exists) {
                    let dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + (st.feeType.dueDays || 30));
                    await tx.studentFee.create({
                        data: {
                            studentId: student.id,
                            schoolId: schoolId,
                            feeStructureId: st.id,
                            amountDue: st.feeType.amount,
                            amountPaid: 0,
                            status: 'UNPAID',
                            dueDate,
                        }
                    });
                }
            }
        });
        console.log("Success");
    } catch (e) {
        console.error(e);
    }
}
main();
