import prisma from "../common/prisma/init.prisma.js";

const dashboardService = {
  buildDashboardSummary: async (userContext) => {
    // userContext: { A_ID, R_Name, M_ID, D_ID }
    const { R_Name, D_ID, M_ID } = userContext;

    // Normalize Role Name to uppercase for check
    const role = R_Name ? R_Name.toUpperCase() : "";

    let scope = "personal";
    if (role.includes("ADMIN") || role.includes("PMO")) scope = "global";
    else if (role.includes("LEADER") || role.includes("MANAGER")) scope = "department";

    // Prepare response structure
    const dashboardData = {
      role: R_Name,
      scope: scope,
      projects: { total: 0, active: 0 },
      tasks: { total: 0, byStatus: {} },
      members: { total: 0 },
      me: { assignedTasks: 0, pendingTasks: 0 },
    };

    // -------------------------------------------------------------
    // 1️⃣ PROJECTS
    // -------------------------------------------------------------
    if (scope === "global") {
      // ADMIN / PMO: Count ALL projects
      const [totalProjects, activeProjects] = await Promise.all([
        prisma.project.count({
          where: { IsDeleted: false },
        }),
        prisma.project.count({
          where: {
            IsDeleted: false,
            Status: "Active", // Assuming "Active" string, adjust if needed
          },
        }),
      ]);
      dashboardData.projects.total = totalProjects;
      dashboardData.projects.active = activeProjects;
    } else if (scope === "department") {
      // LEADER / MANAGER: Count projects in their Department
      if (D_ID) {
        const [totalProjects, activeProjects] = await Promise.all([
          prisma.project.count({
            where: { D_ID: D_ID, IsDeleted: false },
          }),
          prisma.project.count({
            where: {
              D_ID: D_ID,
              IsDeleted: false,
              Status: "Active",
            },
          }),
        ]);
        dashboardData.projects.total = totalProjects;
        dashboardData.projects.active = activeProjects;
      }
    } else {
      // STAFF: Always 0 (default)
    }

    // -------------------------------------------------------------
    // 2️⃣ TASKS
    // -------------------------------------------------------------
    let taskWhere = { IsDeleted: false };
    if (scope === "department") {
      // TASKS in projects of the department
      // Need to find tasks where Project -> D_ID == user.D_ID
      // Prisma `some` filter
      taskWhere.Project = {
        D_ID: D_ID,
      };
    } else if (scope === "personal") {
      // TASKS assigned to this member
      taskWhere.Assigned_ID_M_ID = M_ID;
    }
    // ensure M_ID/D_ID existence if needed, but 'personal' implies M_ID must be there.

    // Group By Status
    const taskGroups = await prisma.task.groupBy({
      by: ["Status"],
      where: taskWhere,
      _count: {
        _all: true, // or T_ID
      },
    });

    let totalTasks = 0;
    const byStatus = {};
    taskGroups.forEach((g) => {
      const s = g.Status || "Unknown";
      const c = g._count._all;
      byStatus[s] = c;
      totalTasks += c;
    });

    dashboardData.tasks.total = totalTasks;
    dashboardData.tasks.byStatus = byStatus;

    // -------------------------------------------------------------
    // 3️⃣ MEMBERS
    // -------------------------------------------------------------
    if (scope === "global") {
      dashboardData.members.total = await prisma.member.count({
        where: { IsDeleted: false },
      });
    } else if (scope === "department") {
      if (D_ID) {
        dashboardData.members.total = await prisma.member.count({
          where: { D_ID: D_ID, IsDeleted: false },
        });
      }
    }
    // STAFF -> 0 (default)

    // -------------------------------------------------------------
    // 4️⃣ ME (Personal Stats for everyone)
    // -------------------------------------------------------------
    // Task assign riêng cho account đó (Member)
    // "me" section: Assigned + Pending
    if (M_ID) {
      // We can use Promise.all for optimization
      const [assignedCount, pendingCount] = await Promise.all([
        prisma.task.count({
          where: {
            Assigned_ID_M_ID: M_ID,
            IsDeleted: false,
          },
        }),
        prisma.task.count({
          where: {
            Assigned_ID_M_ID: M_ID,
            IsDeleted: false,
            Status: "Pending", // Assuming 'Pending' status
          },
        }),
      ]);
      dashboardData.me.assignedTasks = assignedCount;
      dashboardData.me.pendingTasks = pendingCount;
    }

    return dashboardData;
  },
};

export default dashboardService;
