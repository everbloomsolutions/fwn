/**
 * Footer Component
 * Enhanced footer with motion, social links, and improved UI/UX
 */

'use client';

import Link from 'next/link';
import { Container } from './Container';
import { Logo } from '@/shared/ui/brand';
import { motion } from 'framer-motion';
import { brandConfig } from '@/shared/brand';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight,
  FileText,
  Shield
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-border bg-gradient-to-b from-surface to-bg-muted"
    >
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Logo href="/" size="md" variant="auto" className="mb-4" />
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              {brandConfig.description}
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href={brandConfig.social.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-text-muted hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={brandConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-text-muted hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={brandConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-text-muted hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="View our GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-base font-semibold text-text mb-6 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-muted hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-text-muted hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-text-muted hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants}>
            <h4 className="text-base font-semibold text-text mb-6 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${brandConfig.contact.email}`}
                  className="text-sm text-text-muted hover:text-primary transition-colors flex items-start gap-2 group"
                >
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span>{brandConfig.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brandConfig.contact.support}`}
                  className="text-sm text-text-muted hover:text-primary transition-colors flex items-start gap-2 group"
                >
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span>{brandConfig.contact.support}</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919502221144"
                  className="text-sm text-text-muted hover:text-primary transition-colors flex items-start gap-2 group"
                >
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span>+91 95022 21144</span>
                </a>
              </li>
              <li>
                <div className="text-sm text-text-muted flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Flat No. 502, Sonnet Residency,<br />
                    Mayuri Nagar, Miyapur,<br />
                    Hyderabad, Telangana - 500049
                  </span>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Legal & Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-base font-semibold text-text mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-text-muted hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-muted hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 border-t border-border pt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted text-center md:text-left">
              {brandConfig.legal.copyright}
            </p>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <span>Made with</span>
              <span className="text-status-error">♥</span>
              <span>by</span>
              <span className="text-primary font-medium">@yashpal</span>
            </div>
          </div>
        </motion.div>
      </Container>
    </motion.footer>
  );
}
