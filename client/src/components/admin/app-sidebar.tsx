"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import useAuthStore from "@/store/store";
import {
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  FileText,
  FolderKanban,
  GalleryVerticalEnd,
  Gamepad2,
  KeyRound,
  Lightbulb,
  Megaphone,
  Minus,
  Plus,
  SettingsIcon,
  Trophy,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";
import { NavUser } from "./nav-user";

// Helper function to get semester navigation items
const getSemesterItems = () => {
  const semesters = [];
  for (let year = 1; year <= 4; year++) {
    for (let sem = 1; sem <= 2; sem++) {
      semesters.push({
        title: `${year}/${sem}`,
        url: `/semester/${year}-${sem}`,
        icon: <Calendar size={16} />,
      });
    }
  }
  return semesters;
};

// Role-based sidebar configurations
const getSidebarData = (role: string) => {
  switch (role) {
    case "student":
      return {
        navMain: [
          {
            title: "Semester",
            url: "/semester",
            icon: <Calendar size={20} />,
            items: getSemesterItems(),
          },
          {
            title: "AI Support",
            url: "/ai-support",
            icon: <Bot size={20} />,
            items: [
              {
                title: "Research Assistant",
                url: "/ai-support/research-assistant",
                icon: <FileText size={16} />,
              },
              {
                title: "Project Assistant",
                url: "/ai-support/project-assistant",
                icon: <Lightbulb size={16} />,
              },
            ],
          },
          {
            title: "Settings",
            url: "/settings",
            icon: <SettingsIcon size={20} />,
            items: [
              {
                title: "Account",
                url: "/settings/account-manage",
                icon: <UserCog size={16} />,
              },
              {
                title: "Password Manage",
                url: "/settings/password-manage",
                icon: <KeyRound size={16} />,
              },
            ],
          },
        ],
      };

    case "faculty":
      return {
        navMain: [
          {
            title: "Subjects",
            url: "/subjects",
            icon: <BookOpen size={20} />,
            items: [
              {
                title: "My Subjects",
                url: "/subjects",
                icon: <FolderKanban size={16} />,
              },
              {
                title: "Course Materials",
                url: "/subjects/materials",
                icon: <FileText size={16} />,
              },
            ],
          },
          {
            title: "Students",
            url: "/students",
            icon: <Users size={20} />,
          },
          {
            title: "Games",
            url: "/games",
            icon: <Gamepad2 size={20} />,
          },
          {
            title: "AI Support",
            url: "/ai-tutor",
            icon: <Bot size={20} />,
          },
          {
            title: "Settings",
            url: "/settings",
            icon: <SettingsIcon size={20} />,
            items: [
              {
                title: "Account",
                url: "/settings/account-manage",
                icon: <UserCog size={16} />,
              },
              {
                title: "Password Manage",
                url: "/settings/password-manage",
                icon: <KeyRound size={16} />,
              },
            ],
          },
        ],
      };

    case "department_admin":
      return {
        navMain: [
          {
            title: "Semester",
            url: "/semester",
            icon: <Calendar size={20} />,
            items: getSemesterItems(),
          },
          {
            title: "Department",
            url: "/department",
            icon: <Users size={20} />,
            items: [
              {
                title: "Add Student",
                url: "/employee?type=student",
                icon: <UserPlus size={16} />,
              },
              {
                title: "Add Faculty",
                url: "/employee?type=faculty",
                icon: <UserPlus size={16} />,
              },
              {
                title: "Add Courses",
                url: "/subjects",
                icon: <Plus size={16} />,
              },
            ],
          },
          {
            title: "Announcement",
            url: "/announcement",
            icon: <Megaphone size={20} />,
            items: [
              {
                title: "Job Posting",
                url: "/announcement/job-posting",
                icon: <Briefcase size={16} />,
              },
              {
                title: "Add Discovery",
                url: "/announcement/discovery",
                icon: <Lightbulb size={16} />,
              },
              {
                title: "Post Competition",
                url: "/announcement/competition",
                icon: <Trophy size={16} />,
              },
            ],
          },
          {
            title: "Settings",
            url: "/settings",
            icon: <SettingsIcon size={20} />,
            items: [
              {
                title: "Account",
                url: "/settings/account-manage",
                icon: <UserCog size={16} />,
              },
              {
                title: "Password Manage",
                url: "/settings/password-manage",
                icon: <KeyRound size={16} />,
              },
            ],
          },
        ],
      };

    default:
      return {
        navMain: [],
      };
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname(); // Get the current page path

  // Get role-based sidebar data
  const userRole = user?.role || "student";
  const sidebarData = getSidebarData(userRole);

  const handleSignOut = async () => {
    try {
      const response = await Axios.post(
        `${env.BACKEND_BASE_URL}/api/auth/signout`
      );
      if (response.data.success) {
        logout();
        router.push("/sign-in");
      } else {
        throw new Error("Failed to sign out");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Sidebar {...props}
    className="[&>[data-sidebar=sidebar]]:bg-slate-100
    dark:[&>[data-sidebar=sidebar]]:bg-[#191919]
    [&>[data-sidebar=sidebar]]:text-gray-800
    dark:[&>[data-sidebar=sidebar]]:text-white"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">StudyFlow</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Link
            href="/dashboard"
            className="text-sm px-2 py-2 flex items-center gap-2 dark:bg-[#191919] dark:hover:bg-gray-800"
          >
            <GalleryVerticalEnd size={18} />
            <span>Dashboard</span>
          </Link>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarData.navMain.map((item, index) => (
              item.items?.length ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={pathname.startsWith(item.url)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.title}
                        <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2"
                              >
                                {subItem.icon && <span>{subItem.icon}</span>}
                                {subItem.title}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url} className="flex items-center gap-2">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.firstName || null,
            email: user?.email || null,
            avatar: user?.avatar || undefined,
          }}
          onSignOut={handleSignOut}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
