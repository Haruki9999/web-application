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
    }
];

// Initialize localStorage with mock data if not present
function initializeData() {
    if (!localStorage.getItem('programs')) {
        localStorage.setItem('programs', JSON.stringify(programs));
    }

    // Force Set Teachers to Single User (Dr. Sarah) per User Request
    // This overwrites previous data to ensure cleanup
    localStorage.setItem('teachers', JSON.stringify(teachers));
    const storedUsers = JSON.parse(localStorage.getItem('users') || 'null');

    // Self-healing: Check if critical test accounts exist and have passwords
    let dataCorrupted = false;
    if (!storedUsers || !Array.isArray(storedUsers) || storedUsers.length === 0) {
        dataCorrupted = true;
    } else {
        // Check for specific default accounts availability or general corruption
        const hasStudent = storedUsers.some(u => u.role === 'student' && u.password);
        const hasTeacher = storedUsers.some(u => u.role === 'teacher' && u.password);
        // If critical roles missing, or if first user has old password format
        if (!hasStudent || !hasTeacher || (storedUsers[0].password === 'password')) {
            dataCorrupted = true;
        }
    }

    if (dataCorrupted) {
        console.warn('Data corruption detected or critical users missing. Restoring defaults.');
        localStorage.setItem('users', JSON.stringify([
            {
                id: '1',
                email: 'student@test.com',
                phone: '88888888',
                password: '123456',
                role: 'student',
                name: 'John Student',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                bio: 'Grade 10 student passionate about Physics.',
                parentPhone: '88110099', // Parent contact
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
                profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', // Sync with public profile
                totalStudents: 24,
                upcomingClasses: [], // Changed from number 8 to empty array
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

    // Check and Sync Classes Global List
    // Always sync from users to global list to recover "lost" classes from previous versions
    const storedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let hasChanges = false;

    users.forEach(u => {
        if (u.role === 'teacher' && u.upcomingClasses && Array.isArray(u.upcomingClasses) && u.upcomingClasses.length > 0) {
            u.upcomingClasses.forEach(c => {
                // Check if class already exists in global list (by ID)
                const exists = storedClasses.some(gx => gx.id === c.id);
                if (!exists) {
                    // Normalize and Add
                    storedClasses.push({
                        ...c,
                        teacherId: u.id, // Ensure teacherId is set
                        attendanceTaken: c.attendanceTaken || false,
                        students: c.students || 0
                    });
                    hasChanges = true;
                }
            });
        }
    });

    if (hasChanges) {
        localStorage.setItem('classes', JSON.stringify(storedClasses));
        console.log('Restored missing classes from user history:', storedClasses.length);
    }
}

// Call initialization
initializeData();
