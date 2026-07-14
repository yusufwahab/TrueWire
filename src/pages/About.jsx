import { Reveal } from "../components/ui/Reveal";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { PhotoCredit } from "../components/ui/PhotoCredit";
import { useEditorialImage } from "../hooks/useEditorialImage";

export function About() {
  const image = useEditorialImage("Nigeria community phone");

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <Reveal>
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-signal-teal">About</p>
          <blockquote className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            "A correction that arrives a day late has already lost to the rumour it was meant to fix. So we built
            something that moves at the same speed as the forward button."
          </blockquote>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          {image.url ? (
            <img src={image.url} alt={image.alt} className="editorial-photo h-72 w-full rounded-xl object-cover sm:h-96" />
          ) : (
            <PulseSkeleton className="h-72 w-full sm:h-96" rounded="rounded-xl" />
          )}
          <PhotoCredit credit={image.credit} className="mt-2" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-ink">Who's behind this</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/85">
            Truewire is built by a small team based in Nigeria working at the intersection of journalism and
            software — replace this block with your team's actual bios, photos, and background before launch.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-slate/15 bg-paper-raised py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">Why Nigeria, specifically</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/85">
              <p>
                Nigeria has one of the world's largest WhatsApp user bases, and WhatsApp forwards — unlike public
                posts — carry no visible correction thread. A debunked claim keeps moving through group chats at
                exactly the speed it always did, long after it's been disproven elsewhere.
              </p>
              <p>
                Election cycles bring a predictable spike in recycled misinformation: fake result sheets, voided-PVC
                rumours, and manipulated clips reused from a previous cycle with new dates attached. Recognising the
                pattern is often faster than checking each instance from scratch.
              </p>
              <p>
                Cheap, accessible video-editing and early deepfake tools are starting to show up in scam formats
                too — fabricated statements from public figures, doctored screenshots of bank alerts, and lookalike
                registration pages designed to harvest personal information. The claims aren't just wrong; increasingly
                they're manufactured to look right.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
