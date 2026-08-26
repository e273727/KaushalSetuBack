import prisma from '../config/prisma';

export class ProfileService {
  static async updateProfile(userId: string, data: any) {
    const {
      fullName,
      age,
      department,
      currentJobRole,
      targetCareerRole,
      currentAssignment,
      yearsOfExperience,
      highestQualification,
      fieldOfStudy,
    } = data;

    const profileData = {
      fullName: fullName || 'User Profile',
      age: age ? Number(age) : undefined,
      department,
      currentJobRole: currentJobRole || targetCareerRole,
      currentAssignment,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      highestQualification,
      fieldOfStudy,
    };

    // Remove undefined properties
    Object.keys(profileData).forEach(
      (key) => (profileData as any)[key] === undefined && delete (profileData as any)[key]
    );

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    if (data.certificates && Array.isArray(data.certificates)) {
      for (const cert of data.certificates) {
        if (cert.name) {
          try {
            await prisma.certificate.create({
              data: {
                userId,
                certificateName: cert.name,
                issuingOrganization: cert.provider || 'Government Training Institute',
              },
            });
          } catch {}
        }
      }
    }

    return updatedProfile;
  }

  static async addCertificate(userId: string, data: {
    certificateName: string;
    issuingOrganization?: string;
    issueDate?: string;
    expiryDate?: string;
    certificateUrl?: string;
  }) {
    const cert = await prisma.certificate.create({
      data: {
        userId,
        certificateName: data.certificateName,
        issuingOrganization: data.issuingOrganization,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        certificateUrl: data.certificateUrl,
      },
    });

    return cert;
  }

  static async getUserCertificates(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
