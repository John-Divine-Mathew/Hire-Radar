import React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export const TestScheduledEmail = ({
  candidateName = 'Candidate',
  dateString = '[date]',
  timeString = '[starttime] – [endtime]',
  username = '[username]',
  password = '[password]',
  calendarUrl = '#',
}) => {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brandDark: '#1a192b',
              textMain: '#1f2937',
              textMuted: '#4b5563',
              textLight: '#888888',
              bgBox: '#f4f4f6',
              borderBox: '#e5e7eb',
            },
            fontFamily: {
              sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="m-0 bg-[#fafafa] p-0 font-sans antialiased text-textMain">
          <Preview>Your Test is Scheduled</Preview>
          
          {/* Main Container */}
          <Container className="mx-auto my-8 w-full max-w-[600px] overflow-hidden rounded-xl bg-white shadow-sm border border-solid border-[#e8e8e8]">
            
            {/* Header Banner */}
            <Section className="bg-brandDark px-8 py-10">
              <Row>
                {/* Left Side: Logo with fixed structural width */}
                <Column width="120" className="vertical-align-middle">
                  <Img
                    src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZNXd8SEcwnfoGffyW6vCfLdXhc6VydE586RlvtytseQ&s=10'}
                    alt="Hirotec Logo"
                    width="120"
                    className="block filter brightness-0 invert"
                  />
                </Column>
                
                {/* Right Side: Text with explicit gap padding (pl-10) */}
                <Column className="vertical-align-middle pl-10">
                  <Text className="m-0 font-serif text-2xl font-semibold tracking-wide text-white text-left leading-tight">
                    Your Test is Scheduled !!
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Email Body Content */}
            <Section className="px-8 py-8">
              <Text className="m-0 text-base font-normal leading-relaxed">
                Hi {candidateName},
              </Text>
              
              <Text className="mt-4 mb-8 text-base font-normal leading-relaxed text-textMuted">
                We wanted to let you know that you have an upcoming test scheduled. 
                Please make sure you are available and prepared during the window below.
              </Text>

              {/* Schedule & Credentials Details Box */}
              <Section className="rounded-xl bg-bgBox p-6 border border-solid border-borderBox">
                
                {/* Date Row */}
                <Row className="mb-4 pb-4 border-b border-solid border-[#e5e7eb]">
                  <Column className="w-[36px] align-middle">
                    <Container className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-solid border-[#d1d5db] text-center">
                      📅
                    </Container>
                  </Column>
                  <Column className="pl-4 align-middle">
                    <Text className="m-0 text-[11px] font-bold tracking-wider text-textLight uppercase">
                      DATE
                    </Text>
                    <Text className="m-0 text-base font-semibold text-brandDark">
                      {dateString}
                    </Text>
                  </Column>
                </Row>

                {/* Time Row */}
                <Row className="mb-4 pb-4 border-b border-solid border-[#e5e7eb]">
                  <Column className="w-[36px] align-middle">
                    <Container className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-solid border-[#d1d5db] text-center">
                      🕒
                    </Container>
                  </Column>
                  <Column className="pl-4 align-middle">
                    <Text className="m-0 text-[11px] font-bold tracking-wider text-textLight uppercase">
                      TIME
                    </Text>
                    <Text className="m-0 text-base font-semibold text-brandDark">
                      {timeString}
                    </Text>
                  </Column>
                </Row>

                {/* Credentials Row */}
                <Row className="mb-4 pb-4 border-b border-solid border-[#e5e7eb]">
                  <Column className="w-[36px] align-top pt-1">
                    <Container className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-solid border-[#d1d5db] text-center">
                      🔑
                    </Container>
                  </Column>
                  <Column className="pl-4 align-middle">
                    <Text className="m-0 text-[11px] font-bold tracking-wider text-textLight uppercase">
                      LOGIN CREDENTIALS
                    </Text>
                    <Text className="m-0 text-base font-semibold text-brandDark">Username: {username}
                    </Text>
                    <Text className="m-0 text-base font-semibold text-brandDark">Password: {password}
                    </Text>
                  </Column>
                </Row>

                {/* Add to Calendar Action */}
                <Row>
                  <Column className="align-middle">
                    <Link
                      href={calendarUrl}
                      className="inline-flex items-center text-sm font-semibold text-brandDark no-underline hover:underline"
                    >
                      📅 Add to Calendar
                    </Link>
                  </Column>
                </Row>
              </Section>

              <Text className="mt-8 mb-0 text-base font-normal leading-relaxed text-textMuted">
                If you have any questions or need to reschedule, please reach out to us at your earliest convenience.
              </Text>
            </Section>

            {/* Footer Section */}
            <Section className="bg-[#fcfcfd] px-8 py-6 border-t border-solid border-[#f3f4f6]">
              <Text className="m-0 text-xs font-normal text-textLight">
                Glad to have you onboard,
              </Text>
              <Text className="m-0 mt-1 text-sm font-bold text-brandDark">
                Hirotec India
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

TestScheduledEmail.PreviewProps = {
  candidateName: 'John Doe',
  dateString: 'October 24, 2026',
  timeString: '10:00 AM – 11:30 AM (IST)',
  username: 'john.doe@example.com',
  password: 'SecurePassword123!',
  calendarUrl: 'https://example.com/calendar-invite',
};

export default TestScheduledEmail;