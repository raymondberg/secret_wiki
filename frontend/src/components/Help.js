export default function HelpPage() {
  return (
    <div>
      <h2 className="page-title">Guide</h2>
      <div className="section-squash">
        <p>
          Welcome to SecretWiki! SecretWiki is a tool that lets you organize the
          truths in your world quickly and centrally. At first it might be a
          little odd as SecretWiki is different from many other wikis because it
          intentionally hides information from you for storytelling purposes.
        </p>
        <p>
          Start exploring by clicking on the Wiki and/page of your choice, or
          read this page to learn more about how the wiki works. Click "Wiki
          Guide" on the left to return to this page at any time..
        </p>
        <h3>Wiki List</h3>
        <p>
          Let&apos;s start with the top of the page. You will see our beautiful
          logo in the top-left. Then you will find one or more wiki titles for
          this site. Clicking on one of them will navigate to that wiki (fear
          not, clicking on a wiki will not hide this page). This page will show
          up whenever you have no wikis or no pages selected.
        </p>
        <p>
          Each wiki has its own set of pages that you will see load on the left
          side of the page. Hold off clicking on them just yet or you will miss
          the rest of the lesson. Jump to <a href="#pages">the pages section</a>{" "}
          to learn about them now.
        </p>
        <h3>Searchbar</h3>
        <p>
          To the right of the Wiki List is the Searchbar. This field lets you
          type in any text you want and get recommendations for pages containing
          your search. It is a great tool when you are trying to remember the
          location of a fact. Start typing your searchterm and pick the popup
          page that best matches your needs!
        </p>
        <h3>Edit Toggle</h3>
        <p>
          Normally, if you are just reading you want to leave this off. It will
          keep all sections on the page scrunched up, sort of like how you see
          this page. But to the right of the Searchbar is the edit toggle that
          will switch you over to EDIT MODE. Go ahead, do it, you know you want
          to do it. On most pages (not this one) this will split the sections up
          and allow you to manipulate sections on a page. Go ahead and explore a
          few pages to see how this works.
        </p>
        <h3 id="pages">Pages and Editing</h3>
        <p>
          Editing is the focus of this wiki, hence the big edit toggle. If you
          need to change something: double-click it. Double-clicking on a page
          title opens the page settings. Double-clicking on a section opens the
          edit dialog. The aim is to get you into editing as quickly as
          possible.
        </p>
        <p>
          Sections are created by clicking the "gutters" between sections while
          in edit mode. Look for the little (+) signs to create your new
          sections.
        </p>
        <p>
          Sections are updated independently of each other. You can work on a
          section, remember there was something else you want to capture, add
          another section and save it, all before saving your first draft. Just
          remember that changing something about the page will reset the
          sections and any unsaved work.
        </p>
        <h3 id="formatting">Formatting</h3>
        <p>
          Secret Wiki uses `marked` to convert{" "}
          <a href="https://marked.js.org/#specifications">standard markdown</a>{" "}
          into pretty HTML. So start with standard markdown and go from there!
        </p>
        <h3 id="pages">Secrets</h3>
        <p>
          When creating a section or page you are asked if it is secret. Pages
          can only be totally secret (only admins can see it) but sections can
          be restricted by user. When you click the lock button to make a
          section secret you will be given a toggleable list of users. Click all
          the users that should have access to the section after you save it. Be
          careful to always include yourself.
        </p>
        <h3>Philosophy</h3>
        <p>Here are a few heady topics if you find yourself getting stuck.</p>
        <h4>Why secrets at all?</h4>
        <p>
          If you are telling a story collectively (e.g. teaching "Things Fall
          Apart" by Chinua Achebe or running a tabletop roleplaying game) you
          may want to keep detailed notes but keep upcoming modules or story
          beats a secret. By keeping secrets you can flesh out / pre-stage
          details in the same location your collaborators can review and edit
          content.
        </p>
        <p>
          The goal of the wiki is to facilitate the revelation of facts over
          time. Imagine being able to go back to Wikipedia on the day before
          Lincoln was shot and see what the world thought was "THE" story of
          Abraham Lincoln. Secrets effectively allow you to tell a story slowly
          over time from the perspective of people with blended/imperfect
          perception.
        </p>
        <h4>Should I prefer one big section or many sections?</h4>
        <p>
          This depends on your style. In General, the wiki pushes you to think
          more in terms of smaller, interchangable sections. But if you have
          logical topics / multiple headings that you would prefer to keep
          together...go for it! Just keep in mind that when editing pages, users
          may be able to deduce where secrets are if you have only a few section
          breaks.
        </p>
        <p>
          For example, imagine you were describing Abraham Lincoln. If you had
          one section for everything (birth, personal life, presidency, etc...,
          love of theater), then a secret (spoiler: murder), and then a third
          section (after his death, his legacy, the penny is a waste, etc...).
          Someone might deduce that something bad happened to Lincoln at a
          theater even though the section describing the "spoiler" is hidden in
          a secret.
        </p>
        <h4>Pro tips?</h4>
        <p>
          Keyboard shortcuts are limited but growing. Try "ctrl-t" on Mac to
          jump to the Searchbar.
        </p>
      </div>
    </div>
  );
}
