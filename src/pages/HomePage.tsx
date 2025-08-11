import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Star, 
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Sparkles,
  TrendingUp,
  Award,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'AI-powered skill matching connects you with the perfect learning partners instantly.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Join millions of learners and experts from around the world in our vibrant ecosystem.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageSquare,
      title: 'Seamless Communication',
      description: 'Built-in messaging, video calls, and collaboration tools for effective skill exchange.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Star,
      title: 'Verified Excellence',
      description: 'Comprehensive rating system and skill verification ensure quality learning experiences.',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const benefits = [
    'Learn any skill for free through exchange',
    'Teach what you know and earn recognition',
    'Build meaningful global connections',
    'Flexible scheduling that fits your life',
    'Safe and secure platform with verification',
    'Access to exclusive learning resources',
  ];

  const stats = [
    { number: '2M+', label: 'Active Learners', icon: Users },
    { number: '150+', label: 'Countries', icon: Globe },
    { number: '500K+', label: 'Skills Exchanged', icon: TrendingUp },
    { number: '4.9/5', label: 'User Rating', icon: Star },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'UX Designer',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'SkillSwap transformed my career. I learned React development by teaching design principles. The community is incredibly supportive!',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Language Teacher',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Teaching Spanish while learning guitar has been amazing. The platform makes it so easy to connect with passionate learners.',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Software Engineer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'The quality of exchanges is outstanding. I\'ve learned photography, cooking, and business skills all through this platform.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 lg:py-16">
        {/* Background Gradient */}
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-300/10 to-accent-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/30 border border-rose-300 dark:border-rose-300 mb-8"
            >
              <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-400 mr-2" />
              <span className="text-sm font-medium text-rose-500 dark:text-rose-300">
                Join 2M+ learners worldwide
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-3xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight lg:pt-8"
            >
              Learn. Teach.{' '}
              <span className="text-gradient">
                Grow Together.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              The world's most beautiful platform for skill exchange. Connect with passionate 
              learners, share your expertise, and unlock unlimited growth potential.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 lg:pt-6"
            >
              <Link to="/register">
                <button className="group relative px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-400 hover:from-rose-400  hover:to-fuchsia-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg">
                  <span className="flex items-center md:text-sm">
                    Start Learning Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link to="/skills">
                <button className="px-6 py-3 md:text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                  Explore Skills
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto lg:pt-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Choose <span className='text-gradient'>SkillSwap?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Experience the future of learning with our innovative platform designed for modern skill exchange
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="card p-8 h-full hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="md:text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-gray-800 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Unlock Your Potential
              </h2>
              <p className="text-md text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Join thousands of learners and teachers who are already transforming 
                their lives through skill exchange. Experience growth like never before.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-success-400 to-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="md:text-sm text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <div className="card-glass p-6 hover:shadow-glow transition-all duration-300">
                  <Zap className="w-8 h-8 text-primary-500 mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find perfect matches in seconds</p>
                </div>
                <div className="card-glass p-6 hover:shadow-glow transition-all duration-300">
                  <Shield className="w-8 h-8 text-success-500 mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">100% Secure</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your safety is our priority</p>
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="card-glass p-6 hover:shadow-glow transition-all duration-300">
                  <Globe className="w-8 h-8 text-accent-500 mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Global Reach</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect worldwide instantly</p>
                </div>
                <div className="card-glass p-6 hover:shadow-glow transition-all duration-300">
                  <Award className="w-8 h-8 text-warning-500 mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Quality Assured</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified skills and reviews</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Loved by  <span className='text-gradient'>Millions</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="md:text-lg text-gray-600 dark:text-gray-300"
            >
              See what our community has to say about their SkillSwap experience
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="md:text-md text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
       <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-gray-800    relative overflow-hidden">
    
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Ready to Start Your <span className='text-gradient'>Journey?</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-white/90 mb-8 leading-relaxed"
          >
            Join our community today and discover the power of skill exchange. 
            Your next breakthrough is just one connection away.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/register">
              <button className="group px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-400 hover:from-rose-400  hover:to-fuchsia-500 text-white font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="flex items-center">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;