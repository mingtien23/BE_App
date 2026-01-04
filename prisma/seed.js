import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.task_Report.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.account.deleteMany()
  await prisma.role_Permission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.member.deleteMany()
  await prisma.department.deleteMany()

  const permissions = [
    { P_ID: 'P0001', P_Name: 'CREATE_TASK', Description: 'Can create tasks' },
    { P_ID: 'P0002', P_Name: 'VIEW_TASK', Description: 'Can view tasks' },
    { P_ID: 'P0003', P_Name: 'EDIT_TASK', Description: 'Can edit tasks' },
    { P_ID: 'P0004', P_Name: 'DELETE_TASK', Description: 'Can delete tasks' },
  ]
  await prisma.permission.createMany({ data: permissions, skipDuplicates: true })

  const roles = [
    { R_ID: 'R0001', R_Name: 'Admin', Description: 'Administrator role' },
    { R_ID: 'R0002', R_Name: 'Manager', Description: 'Manager role' },
    { R_ID: 'R0003', R_Name: 'Member', Description: 'Regular member' },
  ]
  await prisma.role.createMany({ data: roles, skipDuplicates: true })

  const rolePermissions = [
    { R_ID: 'R0001', P_ID: 'P0001' },
    { R_ID: 'R0001', P_ID: 'P0002' },
    { R_ID: 'R0001', P_ID: 'P0003' },
    { R_ID: 'R0001', P_ID: 'P0004' },
    { R_ID: 'R0002', P_ID: 'P0001' },
    { R_ID: 'R0002', P_ID: 'P0002' },
    { R_ID: 'R0003', P_ID: 'P0002' },
  ]
  await prisma.role_Permission.createMany({ data: rolePermissions, skipDuplicates: true })

  const departments = [
    { D_ID: 'D001', D_Name: 'Engineering' },
    { D_ID: 'D002', D_Name: 'Design', Parent_D_ID: 'D001' },
  ]
  await prisma.department.createMany({ data: departments, skipDuplicates: true })

  const members = [
    { M_ID: 'M001', FullName: 'Alice Doe', PhoneNumber: '1234567890', D_ID: 'D001', JoinDate: new Date() },
    { M_ID: 'M002', FullName: 'Bob Smith', PhoneNumber: '0987654321', D_ID: 'D002', JoinDate: new Date() },
  ]
  await prisma.member.createMany({ data: members, skipDuplicates: true })

  const pw = bcrypt.hashSync('Password123!', 10)
  await prisma.account.createMany({
    data: [
      { A_ID: 'A0001', UserName: 'admin', PassWord: pw, Email: 'admin@example.com', R_ID: 'R0001', M_ID: 'M001' },
      { A_ID: 'A0002', UserName: 'manager', PassWord: pw, Email: 'manager@example.com', R_ID: 'R0002', M_ID: 'M002' },
      { A_ID: 'A0003', UserName: 'member', PassWord: pw, Email: 'member@example.com', R_ID: 'R0003' },
    ],
    skipDuplicates: true,
  })

  await prisma.project.create({
    data: {
      P_ID: 'P0001',
      D_ID: 'D001',
      P_Name: 'Project Alpha',
      Begin_Date: new Date(),
      Created_By_A_ID: 'A0001',
    },
  })

  await prisma.task.create({
    data: {
      T_ID: 'T0001',
      Title: 'Setup repository',
      P_ID: 'P0001',
      Created_By_A_ID: 'A0001',
      Assigned_ID_M_ID: 'M001',
      Priority: 'High',
    },
  })

  await prisma.task_Report.create({
    data: {
      TR_ID: 'TR0001',
      T_ID: 'T0001',
      Progress: '10%',
      Period_Type: 'WEEKLY',
      Period_Start: new Date(),
      Period_End: new Date(),
      Content: 'Initial progress report',
      Created_By_A_ID: 'A0001',
      Reporter_A_ID: 'A0001',
    },
  })

  console.log('Seeding finished.')
}

main().catch((e) => {
  console.error('Seed error:', e)
  process.exitCode = 1
}).finally(async () => {
  await prisma.$disconnect()
})
