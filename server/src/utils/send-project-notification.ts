import nodemailer from 'nodemailer';

interface ProjectMember {
  firstName: string;
  lastName: string;
  email: string;
}

export async function sendProjectAssignmentEmail(
  studentEmail: string,
  studentFirstName: string,
  projectTitle: string,
  projectDescription: string | null,
  instructorName: string,
  instructorEmail: string,
  courseTitle: string,
  projectStatus: string,
  startDate: string | null,
  endDate: string | null,
  projectUrl: string | null,
  teamMembers: ProjectMember[]
) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format dates
    const formatDate = (date: string | null) => {
      if (!date) return 'Not specified';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Generate team members HTML
    const teamMembersHtml = teamMembers
      .map(
        (member, index) => `
        <div style="display: flex; align-items: center; padding: 8px; background: ${
          index % 2 === 0 ? '#f9f9f9' : '#ffffff'
        }; border-radius: 4px; margin-bottom: 4px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; margin-right: 12px;">
            ${member.firstName[0]}${member.lastName[0]}
          </div>
          <div>
            <div style="font-weight: 500; color: #333; font-size: 14px;">${
              member.firstName
            } ${member.lastName}</div>
            <div style="color: #666; font-size: 12px;">${member.email}</div>
          </div>
        </div>
      `
      )
      .join('');

    // Status badge color
    const statusColors: { [key: string]: { bg: string; text: string } } = {
      proposed: { bg: '#e3f2fd', text: '#1976d2' },
      ongoing: { bg: '#e8f5e9', text: '#388e3c' },
      completed: { bg: '#f3e5f5', text: '#7b1fa2' },
      archived: { bg: '#fafafa', text: '#616161' },
    };

    const statusColor = statusColors[projectStatus] || statusColors.proposed;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `🎯 You've been assigned to: ${projectTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Project Assignment</h1>
            <p style="color: #e8e8ff; margin: 8px 0 0 0; font-size: 14px;">You've been added to a new project</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 25px;">

            <!-- Greeting -->
            <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
              Hi <strong>${studentFirstName}</strong>,
            </p>

            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 25px 0;">
              Great news! You have been assigned to a new project for <strong>${courseTitle}</strong>. Here are the details:
            </p>

            <!-- Project Info Card -->
            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #667eea;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h2 style="color: #2c3e50; margin: 0; font-size: 20px; font-weight: 600; flex: 1;">${projectTitle}</h2>
                <span style="background: ${statusColor.bg}; color: ${
        statusColor.text
      }; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; white-space: nowrap; margin-left: 10px;">
                  ${projectStatus}
                </span>
              </div>
              ${
                projectDescription
                  ? `<p style="color: #555; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">${projectDescription}</p>`
                  : ''
              }
            </div>

            <!-- Project Supervisor -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <div style="color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                👨‍🏫 Project Supervisor
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-right: 12px;">
                  ${instructorName.split(' ')[0][0]}${
        instructorName.split(' ')[1]?.[0] || ''
      }
                </div>
                <div>
                  <div style="font-weight: 600; color: #333; font-size: 15px;">${instructorName}</div>
                  <div style="color: #666; font-size: 13px;">${instructorEmail}</div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div style="background: #fff9e6; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #ffe066;">
              <div style="color: #856404; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
                📅 Project Timeline
              </div>
              <div style="display: flex; justify-content: space-around;">
                <div style="text-align: center;">
                  <div style="color: #856404; font-size: 11px; margin-bottom: 4px;">START DATE</div>
                  <div style="color: #333; font-weight: 600; font-size: 14px;">${formatDate(
                    startDate
                  )}</div>
                </div>
                <div style="width: 1px; background: #ffe066;"></div>
                <div style="text-align: center;">
                  <div style="color: #856404; font-size: 11px; margin-bottom: 4px;">END DATE</div>
                  <div style="color: #333; font-weight: 600; font-size: 14px;">${formatDate(
                    endDate
                  )}</div>
                </div>
              </div>
            </div>

            <!-- Team Members -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <div style="color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                👥 Team Members (${teamMembers.length})
              </div>
              <div style="max-height: 200px; overflow-y: auto;">
                ${teamMembersHtml}
              </div>
            </div>

            ${
              projectUrl
                ? `
            <!-- Project URL -->
            <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin-bottom: 25px; border-left: 3px solid #4caf50;">
              <div style="color: #2e7d32; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                🔗 Project Repository
              </div>
              <a href="${projectUrl}" target="_blank" style="color: #1976d2; text-decoration: none; word-break: break-all; font-size: 14px; font-weight: 500;">
                ${projectUrl}
              </a>
            </div>
            `
                : ''
            }

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || 'http://localhost:3000'
              }/semester" target="_blank" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                font-size: 16px;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;">
                View Project Details
              </a>
            </div>

            <!-- Important Note -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 13px; color: #856404; margin: 0; line-height: 1.6;">
                <strong>📌 Important:</strong> Please coordinate with your team members and supervisor to ensure smooth project execution. Regular updates and communication are key to success!
              </p>
            </div>

            <!-- Help Section -->
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
                If you have any questions about this project, please contact your project supervisor or reach out to your course administrator.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px 25px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px 0;">
              This is an automated notification from your course management system.
            </p>
            <p style="font-size: 11px; color: #999; margin: 0;">
              © ${new Date().getFullYear()} Academic Project Management System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Project assignment email sent to ${studentEmail}: ${info.response}`
    );
    return { success: true, message: `Email sent: ${info.response}` };
  } catch (error) {
    console.error(
      `Error sending project assignment email to ${studentEmail}:`,
      error
    );
    return { success: false, message: 'Failed to send email', error };
  }
}
