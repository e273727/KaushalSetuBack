import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting KaushalSetu database seed...');

  // Clean existing data in reverse order of dependencies
  await prisma.assessmentAnswer.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.learningActivity.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.userCompetency.deleteMany();
  await prisma.jobRoleCompetency.deleteMany();
  await prisma.courseCompetency.deleteMany();
  await prisma.course.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // 1. Competencies
  console.log('Seeding competencies...');
  const competenciesData = [
    { name: 'Survey Design', domain: 'Statistical', description: 'Design national survey instruments, questionnaires, and metadata standards.' },
    { name: 'Sampling', domain: 'Statistical', description: 'Apply probability sampling, stratification, and sample weight estimation.' },
    { name: 'Data Quality & Validation', domain: 'Statistical', description: 'Statistical data audit, outlier detection, and clean dataset validation.' },
    { name: 'Python for Statistics', domain: 'Technical', description: 'Data manipulation, Pandas, NumPy, and statistical calculations in Python.' },
    { name: 'R Programming', domain: 'Technical', description: 'Statistical modelling, econometrics, and hypothesis testing in R.' },
    { name: 'SQL & Database Querying', domain: 'Technical', description: 'Relational query design, joining statistical tables, and data transformation.' },
    { name: 'Data Visualization', domain: 'Technical', description: 'Creating executive dashboards, charts, and spatial statistical maps.' },
    { name: 'AI & Machine Learning', domain: 'Technical', description: 'Predictive analytics, NLP, and machine learning models for public policy.' },
    { name: 'Digital Governance & Cybersecurity', domain: 'Digital Governance', description: 'Data privacy rules, government IT security protocols, and compliance.' },
    { name: 'Leadership & Project Management', domain: 'Behavioural', description: 'Team leadership, project coordination, and inter-departmental communication.' },
  ];

  const createdCompetencies: Record<string, any> = {};
  for (const comp of competenciesData) {
    const created = await prisma.competency.create({ data: comp });
    createdCompetencies[comp.name] = created;
  }

  // 2. Job Roles
  console.log('Seeding job roles...');
  const jobRolesData = [
    { name: 'Statistical Officer', description: 'Oversees statistical surveys, sampling methods, and data release reports.' },
    { name: 'Data Analyst', description: 'Analyzes public sector data, builds dashboards, and writes statistical code.' },
    { name: 'Survey Officer', description: 'Manages field survey operations, survey design, and data quality checks.' },
    { name: 'Data Processing Officer', description: 'Manages database systems, data cleaning pipelines, and data security.' },
  ];

  const createdJobRoles: Record<string, any> = {};
  for (const role of jobRolesData) {
    const created = await prisma.jobRole.create({ data: role });
    createdJobRoles[role.name] = created;
  }

  // 3. Job Role Competencies Mappings
  console.log('Seeding job role competency requirements...');
  const jobRoleRequirements = [
    // Statistical Officer
    { role: 'Statistical Officer', competency: 'Survey Design', level: 5 },
    { role: 'Statistical Officer', competency: 'Sampling', level: 5 },
    { role: 'Statistical Officer', competency: 'Data Quality & Validation', level: 4 },
    { role: 'Statistical Officer', competency: 'Python for Statistics', level: 3 },
    { role: 'Statistical Officer', competency: 'SQL & Database Querying', level: 3 },
    { role: 'Statistical Officer', competency: 'Data Visualization', level: 3 },
    { role: 'Statistical Officer', competency: 'AI & Machine Learning', level: 2 },
    { role: 'Statistical Officer', competency: 'Leadership & Project Management', level: 4 },

    // Data Analyst
    { role: 'Data Analyst', competency: 'Python for Statistics', level: 4 },
    { role: 'Data Analyst', competency: 'R Programming', level: 4 },
    { role: 'Data Analyst', competency: 'SQL & Database Querying', level: 5 },
    { role: 'Data Analyst', competency: 'Data Visualization', level: 5 },
    { role: 'Data Analyst', competency: 'AI & Machine Learning', level: 3 },
    { role: 'Data Analyst', competency: 'Data Quality & Validation', level: 4 },

    // Survey Officer
    { role: 'Survey Officer', competency: 'Survey Design', level: 5 },
    { role: 'Survey Officer', competency: 'Sampling', level: 4 },
    { role: 'Survey Officer', competency: 'Data Quality & Validation', level: 5 },
    { role: 'Survey Officer', competency: 'Digital Governance & Cybersecurity', level: 3 },
  ];

  for (const req of jobRoleRequirements) {
    await prisma.jobRoleCompetency.create({
      data: {
        jobRoleId: createdJobRoles[req.role].id,
        competencyId: createdCompetencies[req.competency].id,
        requiredLevel: req.level,
      },
    });
  }

  // 4. Courses (iGOT & NSSTA TPAC)
  console.log('Seeding courses...');
  const coursesData = [
    {
      title: 'Advanced Sampling Techniques for National Surveys',
      description: 'Comprehensive module covering stratified random sampling, cluster sampling, and weight calibrations.',
      provider: 'NSSTA TPAC',
      source: 'nssta',
      externalCourseId: 'NSSTA-SAMP-501',
      level: 4,
      durationMinutes: 240,
      courseUrl: 'https://nssta.gov.in/courses/sampling-techniques',
      competencies: ['Sampling', 'Survey Design'],
    },
    {
      title: 'Python for Data Analysis in Public Sector',
      description: 'Learn Pandas, NumPy, and Matplotlib tailored for government statistical datasets.',
      provider: 'iGOT Karmayogi',
      source: 'igot',
      externalCourseId: 'IGOT-PY-201',
      level: 3,
      durationMinutes: 180,
      courseUrl: 'https://igotkarmayogi.gov.in/courses/python-data-analysis',
      competencies: ['Python for Statistics', 'Data Visualization'],
    },
    {
      title: 'Statistical Data Quality Audit & Verification',
      description: 'Frameworks for detecting statistical anomalies, missing values, and data cleaning pipelines.',
      provider: 'NSSTA TPAC',
      source: 'nssta',
      externalCourseId: 'NSSTA-DQ-301',
      level: 4,
      durationMinutes: 150,
      courseUrl: 'https://nssta.gov.in/courses/data-quality',
      competencies: ['Data Quality & Validation'],
    },
    {
      title: 'SQL Fundamentals for Government Data Warehouses',
      description: 'Master relational queries, indexing, CTEs, and aggregation functions for large survey datasets.',
      provider: 'iGOT Karmayogi',
      source: 'igot',
      externalCourseId: 'IGOT-SQL-101',
      level: 2,
      durationMinutes: 120,
      courseUrl: 'https://igotkarmayogi.gov.in/courses/sql-fundamentals',
      competencies: ['SQL & Database Querying'],
    },
    {
      title: 'Applied AI & Machine Learning for Governance',
      description: 'Introductory guide to predictive modeling, computer vision, and NLP applications in governance.',
      provider: 'iGOT Karmayogi',
      source: 'igot',
      externalCourseId: 'IGOT-AI-401',
      level: 3,
      durationMinutes: 300,
      courseUrl: 'https://igotkarmayogi.gov.in/courses/ai-governance',
      competencies: ['AI & Machine Learning'],
    },
  ];

  for (const c of coursesData) {
    const { competencies, ...courseFields } = c;
    const course = await prisma.course.create({ data: courseFields });
    for (const compName of competencies) {
      if (createdCompetencies[compName]) {
        await prisma.courseCompetency.create({
          data: {
            courseId: course.id,
            competencyId: createdCompetencies[compName].id,
          },
        });
      }
    }
  }

  // 5. Questions & Options
  console.log('Seeding assessment questions...');
  const questionsData = [
    {
      competencyName: 'Sampling',
      questionText: 'Which sampling technique is most appropriate when population subgroups are highly distinct and equal representation is required?',
      difficulty: 3,
      explanation: 'Stratified random sampling ensures that each subgroup (stratum) of a population is adequately represented within the whole sample.',
      options: [
        { optionText: 'Simple Random Sampling', isCorrect: false },
        { optionText: 'Stratified Random Sampling', isCorrect: true },
        { optionText: 'Convenience Sampling', isCorrect: false },
        { optionText: 'Snowball Sampling', isCorrect: false },
      ],
    },
    {
      competencyName: 'Python for Statistics',
      questionText: 'Which Pandas method is primarily used to handle missing null values in a dataset?',
      difficulty: 2,
      explanation: 'fillna() or dropna() are used in Pandas to treat missing values.',
      options: [
        { optionText: 'df.dropna() or df.fillna()', isCorrect: true },
        { optionText: 'df.clean()', isCorrect: false },
        { optionText: 'df.remove_null()', isCorrect: false },
        { optionText: 'df.filter_null()', isCorrect: false },
      ],
    },
    {
      competencyName: 'Data Quality & Validation',
      questionText: 'What is the primary purpose of outlier detection during survey data processing?',
      difficulty: 3,
      explanation: 'Identifying extreme values ensures statistical estimators (like mean and variance) are not skewed by data entry errors.',
      options: [
        { optionText: 'To delete all extreme values automatically', isCorrect: false },
        { optionText: 'To identify data entry errors or legitimate extreme phenomena', isCorrect: true },
        { optionText: 'To increase the sample size', isCorrect: false },
        { optionText: 'To compress the dataset size', isCorrect: false },
      ],
    },
  ];

  for (const q of questionsData) {
    const competency = createdCompetencies[q.competencyName];
    const question = await prisma.question.create({
      data: {
        competencyId: competency ? competency.id : null,
        questionText: q.questionText,
        difficulty: q.difficulty,
        explanation: q.explanation,
        options: {
          create: q.options,
        },
      },
    });
  }

  // 6. Users & Profiles
  console.log('Seeding initial users...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kaushalsetu.gov.in',
      passwordHash,
      role: 'admin',
      profile: {
        create: {
          fullName: 'System Administrator',
          department: 'Ministry of Statistics & Programme Implementation',
          currentJobRole: 'Administrator',
          yearsOfExperience: 10,
        },
      },
      streak: {
        create: {
          currentStreak: 5,
          longestStreak: 14,
          lastActivityDate: new Date(),
        },
      },
    },
  });

  // Learner User
  const officer = await prisma.user.create({
    data: {
      email: 'officer@kaushalsetu.gov.in',
      passwordHash,
      role: 'learner',
      profile: {
        create: {
          fullName: 'Rohit Sharma',
          age: 32,
          department: 'National Sample Survey Office (NSSO)',
          currentJobRole: 'Statistical Officer',
          currentAssignment: 'Annual Survey of Unincorporated Sector Enterprises',
          yearsOfExperience: 6.5,
          highestQualification: 'M.Sc. Statistics',
          fieldOfStudy: 'Mathematical Statistics',
        },
      },
      certificates: {
        create: [
          {
            certificateName: 'Certificate in Advanced Probability Theory',
            issuingOrganization: 'Indian Statistical Institute (ISI)',
            issueDate: new Date('2022-06-15'),
          },
          {
            certificateName: 'Python for Statistical Computing',
            issuingOrganization: 'iGOT Karmayogi',
            issueDate: new Date('2023-11-20'),
          },
        ],
      },
      streak: {
        create: {
          currentStreak: 3,
          longestStreak: 9,
          lastActivityDate: new Date(),
        },
      },
    },
  });

  // Seed user competencies for officer
  console.log('Seeding user competencies for sample officer...');
  const initialOfficerCompetencies = [
    { comp: 'Survey Design', level: 4, score: 80.0 },
    { comp: 'Sampling', level: 3, score: 62.5 },
    { comp: 'Data Quality & Validation', level: 3, score: 65.0 },
    { comp: 'Python for Statistics', level: 2, score: 45.0 },
    { comp: 'SQL & Database Querying', level: 2, score: 40.0 },
    { comp: 'Data Visualization', level: 1, score: 25.0 },
  ];

  for (const item of initialOfficerCompetencies) {
    if (createdCompetencies[item.comp]) {
      await prisma.userCompetency.create({
        data: {
          userId: officer.id,
          competencyId: createdCompetencies[item.comp].id,
          currentLevel: item.level,
          score: item.score,
          lastAssessedAt: new Date(),
        },
      });
    }
  }

  console.log('✅ KaushalSetu seed completed successfully!');
  console.log('🔑 Default Users:');
  console.log('   Admin: admin@kaushalsetu.gov.in / Password123!');
  console.log('   Learner: officer@kaushalsetu.gov.in / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
