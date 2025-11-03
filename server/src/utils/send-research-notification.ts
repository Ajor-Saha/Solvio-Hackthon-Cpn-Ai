import nodemailer from 'nodemailer';

interface ResearchMember {
  firstName: string;
  lastName: string;
  email: string;
}

export async function sendResearchAssignmentEmail(
  studentEmail: string,
  studentFirstName: string,
  researchTitle: string,
  researchDescription: string | null,
  supervisorName: string,
  supervisorEmail: string,
  courseTitle: string,
  researchStatus: string,
  startDate: string | null,
  endDate: string | null,
  publicationUrl: string | null,
  teamMembers: ResearchMember[]
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
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; margin-right: 12px;">
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
      proposed: { bg: '#e0f2fe', text: '#0369a1' },
      ongoing: { bg: '#fef3c7', text: '#d97706' },
      completed: { bg: '#dcfce7', text: '#16a34a' },
      published: { bg: '#f3e8ff', text: '#9333ea' },
      archived: { bg: '#f5f5f5', text: '#737373' },
    };

    const statusColor = statusColors[researchStatus] || statusColors.proposed;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `🔬 You've been assigned to Research: ${researchTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔬</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Research Assignment</h1>
            <p style="color: #fed7aa; margin: 8px 0 0 0; font-size: 14px;">You've been added to a new research project</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 25px;">

            <!-- Greeting -->
            <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
              Hi <strong>${studentFirstName}</strong>,
            </p>

            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 25px 0;">
              Congratulations! You have been assigned to a research project for <strong>${courseTitle}</strong>. Here are the details:
            </p>

            <!-- Research Info Card -->
            <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f97316;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <h2 style="color: #7c2d12; margin: 0; font-size: 20px; font-weight: 600; flex: 1; min-width: 200px;">${researchTitle}</h2>
                <span style="background: ${statusColor.bg}; color: ${
        statusColor.text
      }; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; white-space: nowrap;">
                  ${researchStatus}
                </span>
              </div>
              ${
                researchDescription
                  ? `<p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">${researchDescription}</p>`
                  : ''
              }
            </div>

            <!-- Research Supervisor -->
            <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <div style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                👨‍🔬 Research Supervisor
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-right: 12px;">
                  ${supervisorName.split(' ')[0][0]}${
        supervisorName.split(' ')[1]?.[0] || ''
      }
                </div>
                <div>
                  <div style="font-weight: 600; color: #7c2d12; font-size: 15px;">${supervisorName}</div>
                  <div style="color: #9a3412; font-size: 13px;">${supervisorEmail}</div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div style="background: #fef9c3; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #fde047;">
              <div style="color: #854d0e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
                📅 Research Timeline
              </div>
              <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div style="text-align: center; min-width: 120px;">
                  <div style="color: #854d0e; font-size: 11px; margin-bottom: 4px;">START DATE</div>
                  <div style="color: #422006; font-weight: 600; font-size: 14px;">${formatDate(
                    startDate
                  )}</div>
                </div>
                <div style="width: 1px; background: #fde047;"></div>
                <div style="text-align: center; min-width: 120px;">
                  <div style="color: #854d0e; font-size: 11px; margin-bottom: 4px;">END DATE</div>
                  <div style="color: #422006; font-weight: 600; font-size: 14px;">${formatDate(
                    endDate
                  )}</div>
                </div>
              </div>
            </div>

            <!-- Research Team -->
            <!-- Research Team -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <div style="color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                👥 Research Team (${teamMembers.length})
              </div>
              <div style="max-height: 200px; overflow-y: auto;">
                ${teamMembersHtml}
              </div>
            </div>

            ${
              publicationUrl
                ? `
            <!-- Publication URL -->
            <div style="background: #faf5ff; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 3px solid #a855f7;">
              <div style="color: #6b21a8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                📄 Publication Link
              </div>
              <a href="${publicationUrl}" target="_blank" style="color: #7c3aed; text-decoration: none; word-break: break-all; font-size: 14px; font-weight: 500;">
                ${publicationUrl}
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
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                font-size: 16px;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
                transition: all 0.3s ease;">
                View Research Details
              </a>
            </div>

            <!-- Important Note -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.6;">
                <strong>🔬 Important:</strong> Research work requires dedication and collaboration. Please maintain regular communication with your supervisor and team members. Document your progress and findings systematically.
              </p>
            </div>

            <!-- Help Section -->
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
                If you have any questions about this research project, please contact your research supervisor or reach out to your course administrator.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px 25px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px 0;">
              This is an automated notification from your course management system.
            </p>
            <p style="font-size: 11px; color: #999; margin: 0;">
              © ${new Date().getFullYear()} Academic Research Management System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Research assignment email sent to ${studentEmail}: ${info.response}`
    );
    return { success: true, message: `Email sent: ${info.response}` };
  } catch (error) {
    console.error(
      `Error sending research assignment email to ${studentEmail}:`,
      error
    );
    return { success: false, message: 'Failed to send email', error };
  }
}
