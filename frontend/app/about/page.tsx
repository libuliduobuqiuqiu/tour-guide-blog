export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-8">About Me</h1>
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/3">
          <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
            {/* Placeholder for Janet's photo */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              [ Janet's Photo ]
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 prose prose-lg">
          <p>
            Hi, I'm <strong>Janet</strong>, your personal tour guide for Chongqing and Chengdu. 
            With over 10 years of experience in the travel industry, I specialize in creating 
            personalized, off-the-beaten-path experiences that showcase the true soul of Southwest China.
          </p>
          <p>
            My journey as a guide started from my deep love for my hometown, Chongqing. 
            I wanted to show visitors that there's more to this city than just the popular 
            tourist spots. From the spicy flavors of authentic local hotpot to the tranquil 
            tea houses hidden in old alleys, I'll take you where the locals go.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Why I Love What I Do</h2>
          <p>
            Traveling is about more than just seeing new places; it's about connecting with people 
            and cultures. I take pride in being a bridge between my culture and yours, 
            helping you understand the history, the humor, and the heart of the people here.
          </p>
        </div>
      </div>
    </div>
  );
}
