// Mock data for the application

const programs = [
    {
        id: '1',
        name: 'SAT Mathematics Mastery',
        qualification: 'SAT',
        level: 'Advanced',
        duration: '12 weeks',
        price: 899,
        description: 'Comprehensive SAT math preparation covering all topics',
        features: ['Practice tests', 'Video lessons', 'Personal tutor', 'Score guarantee']
    },
    {
        id: '2',
        name: 'IGCSE Mathematics Core',
        qualification: 'IGCSE',
        level: 'Foundation',
        duration: '16 weeks',
        price: 799,
        description: 'Complete IGCSE mathematics core curriculum',
        features: ['Weekly sessions', 'Past papers', 'Exam techniques', 'Progress tracking']
    },
    {
        id: '3',
        name: 'A Level Pure Mathematics',
        qualification: 'A Level',
        level: 'Advanced',
        duration: '20 weeks',
        price: 1199,
        description: 'In-depth A Level pure mathematics training',
        features: ['Expert tutors', 'Mock exams', 'Study materials', 'Small groups']
    },
    {
        id: '4',
        name: 'ACT Math Excellence',
        qualification: 'ACT',
        level: 'Intermediate',
        duration: '10 weeks',
        price: 749,
        description: 'ACT mathematics section focused preparation',
        features: ['Timed practice', 'Strategy sessions', 'Question analysis', 'Score improvement']
    },
    {
        id: '5',
        name: 'IB Mathematics HL',
        qualification: 'IB',
        level: 'Higher Level',
        duration: '24 weeks',
        price: 1499,
        description: 'International Baccalaureate Higher Level Mathematics',
        features: ['IA support', 'Concept mastery', 'Exam prep', 'University ready']
    },
    {
        id: '6',
        name: 'AS Level Statistics',
        qualification: 'AS Level',
        level: 'Foundation',
        duration: '14 weeks',
        price: 899,
        description: 'AS Level statistics and probability course',
        features: ['Data analysis', 'Probability theory', 'Statistical tests', 'Real applications']
    }
];

const teachers = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        specialization: ['SAT', 'ACT', 'Algebra'],
        rating: 4.9,
        experience: '12 years',
        isApproved: true,
        bio: 'PhD in Mathematics Education with expertise in standardized test preparation'
    },
    {
        id: '2',
        name: 'Prof. Michael Chen',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        specialization: ['IGCSE', 'A Level', 'Calculus'],
        rating: 4.8,
        experience: '15 years',
        isApproved: true,
        bio: 'Former university professor specializing in advanced mathematics'
    },
    {
        id: '3',
        name: 'Ms. Emily Rodriguez',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        specialization: ['IB', 'AS Level', 'Statistics'],
        rating: 4.9,
        experience: '10 years',
        isApproved: true,
        bio: 'IB examiner and experienced international mathematics educator'
    },
    {
        id: '4',
        name: 'Dr. James Wilson',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        specialization: ['A Level', 'Further Maths', 'Mechanics'],
        rating: 4.7,
        experience: '18 years',
        isApproved: true,
        bio: 'Specializes in advanced mathematics and mechanics'
    },
    {
        id: '5',
        name: 'Ms. Aisha Patel',
        photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
        specialization: ['IGCSE', 'SAT', 'Geometry'],
        rating: 4.8,
        experience: '8 years',
        isApproved: true,
        bio: 'Passionate educator with focus on building strong foundations'
    },
    {
        id: '6',
        name: 'Mr. David Kim',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        specialization: ['ACT', 'SAT', 'Algebra'],
        rating: 4.9,
        experience: '11 years',
        isApproved: true,
        bio: 'Expert in test-taking strategies and mathematics fundamentals'
    }
];

// Initialize localStorage with mock data if not present
function initializeData() {
    if (!localStorage.getItem('programs')) {
        localStorage.setItem('programs', JSON.stringify(programs));
    }
    if (!localStorage.getItem('teachers')) {
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    const storedUsers = JSON.parse(localStorage.getItem('users') || 'null');
    // Force re-init if users don't exist, OR missing phone, OR password is the old 'password' instead of '123456'
    if (!storedUsers || (storedUsers.length > 0 && (!storedUsers[0].phone || storedUsers[0].password === 'password'))) {
        localStorage.setItem('users', JSON.stringify([
            {
                id: '1',
                email: 'student@test.com',
                phone: '88888888',
                password: '123456',
                role: 'student',
                name: 'John Student',
                enrolledPrograms: ['1', '2'],
                completedHours: 45,
                upcomingClasses: [
                    { id: '1', subject: 'SAT Math', teacher: 'Dr. Sarah Johnson', date: '2025-12-02', time: '14:00', duration: 2 },
                    { id: '2', subject: 'IGCSE Math', teacher: 'Prof. Michael Chen', date: '2025-12-03', time: '16:00', duration: 1.5 }
                ]
            },
            {
                id: '2',
                email: 'teacher@test.com',
                phone: '99999999',
                password: '123456',
                role: 'teacher',
                name: 'Dr. Sarah Johnson',
                teacherId: '1',
                isApproved: true,
                totalStudents: 24,
                upcomingClasses: 8,
                materialsUploaded: 15,
                reviews: [
                    { id: 'r1', studentName: 'John Student', rating: 5, comment: 'Dr. Sarah makes complex algebra so easy to understand! Highly recommended.', date: '2025-11-15' },
                    { id: 'r2', studentName: 'Emma W.', rating: 4, comment: 'Great classes, very structured.', date: '2025-11-20' }
                ]
            },
            {
                id: '3',
                email: 'admin@test.com',
                phone: '11111111',
                password: '123456',
                role: 'admin',
                name: 'Admin User'
            }
        ]));
    }
    if (!localStorage.getItem('pendingTeachers')) {
        localStorage.setItem('pendingTeachers', JSON.stringify([
            {
                id: 't1',
                name: 'Alex Thompson',
                email: 'alex.thompson@email.com',
                specialization: 'Calculus, Statistics',
                experience: '7 years',
                qualifications: 'MSc Mathematics',
                appliedDate: '2025-11-28'
            }
        ]));
    }
}

// Call initialization
initializeData();
