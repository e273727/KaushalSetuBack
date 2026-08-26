import prisma from '../config/prisma';

export class ProfileService {
  static async updateProfile(userId: string, data: {
    fullName?: string;
    age?: number;
    department?: string;
    currentJobRole?: string;
    currentAssignment?: string;
    yearsOfExperience?: number;
    highestQualification?: string;
    fieldOfStudy?: string;
  }) {
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        fullName: data.fullName || 'User Profile',
        ...data,
      },
    });

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
