import "./Shelf.css";
import Phone from "../sounds/old-rotary-phone-1-296475.mp3";
import Book from "../sounds/flipping-book-101929.mp3";
import FirstAid from "../sounds/old-metal-lunch-box-71223.mp3";
import MetalBox from "../sounds/box-crash-106687.mp3";
import Cassette from "../sounds/cassette-34173.mp3"
import Ball from "../sounds/small-ball-393217.mp3"
import Pickup from "../sounds/item-removed-from-box-140495.mp3"

const Shelf = ({ onItemClick, onTooltip, onTooltipHide, incrementItemClicks,playSound, triggerVibration,showComment, unlockEasterEgg }) => {
  return (
    <div className="cube shelf">
                  <div className="cube shelf-level level-1">
                    <div 
                      className="item skull" 
                      data-title="A Shiny Skull" 
                      data-comment="Wow, it has full set of teeth!"
                      onClick={(e) => {
                        incrementItemClicks("skull");
                        playSound(Pickup);
                        triggerVibration(30);
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                      }}
                    >
                      <div className="item-inner">
                        <span className="visually-hidden">A metalic skull</span>
                      </div>
                    </div>
    
                    <div
                      className="item cassette"
                      data-title="Some old cassette"
                      data-comment="What do we have there? Bryan Adams - Summer of ... Oh no. Stuck forever in my head."
                      onClick={(e) => {
                        playSound(Cassette, {duration: 2});
                        incrementItemClicks("cassette");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="item item-inner">
                        <span className="visually-hidden">Old cassette</span>
                      </div>
                    </div>
                    
                    <div
                      className="item ball"
                      data-title="A random billiard ball"  
                      data-comment="What number is this? Does it matter? It's just a ball."
                      onClick={(e) => {
                        playSound(Ball);
                        incrementItemClicks("ball");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="item item-inner">
                        <span className="visually-hidden">Black billiard ball with number 8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cube shelf-level level-2">
                    <div 
                      className="item globe egg" 
                      data-title="An old globe" 
                      data-comment="Where is Czechia? Europe, right? Damn, I hate geography. Wait, what… is there a mic in the stand?"
                      onClick={(e) => {
                        playSound(Pickup);
                        incrementItemClicks("globe");
                        unlockEasterEgg("globe"); // save to LocalStorage
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg, "easter-egg");
                        triggerVibration(30);
                      }}
                    >
                      <div className="item-inner item">
                        <span className="visually-hidden">An Old Globe</span>
                      </div>
                    </div>
                    
                    <div
                      className="item phone"
                      data-title="Ancient Technology"
                      data-comment="Maybe it still works? I'll call my mom. 6-0-2 Oh no! My finger got stuck!"
                      onClick={(e) => {
                        playSound(Phone, {duration: 4.2});
                        incrementItemClicks("phone");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="item-inner item">
                        <span className="visually-hidden">Old rotary phone</span>
                      </div>
                    </div>
                    
                    <div
                      className="item book"
                      data-title="An old book"
                      data-comment="He gazed up at the enormous face. Forty years it had taken him to learn what kind of smile was hidden beneath the dark moustache. O cruel, needless misunderstanding! O stubborn, self-willed exile from the loving breast! Two gin-scented tears trickled down the sides of his nose. But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother. I know this book!"
                      onClick={(e) => {
                        playSound(Book);
                        incrementItemClicks("book");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="item-inner item">
                        <span className="visually-hidden">Old book</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cube shelf-level level-3">
                    <div
                      className="item item-cube left-cube"
                      id="hover-not"
                      data-title="An army Medical Kit"
                      data-comment="I hope there is something useful inside. Ouch, my finger! Thank goodness I have this first aid kit."
                      onClick={(e) => {
                        playSound(FirstAid, {duration: 6});
                        incrementItemClicks("first-aid");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="cube medical-chest item" id="hover-not">
                        <span className="visually-hidden">Old army medical kit</span>
                      </div>
                    </div>
                    
                    <div
                      className="item item-cube right-cube"
                      id="hover-not"
                      data-title="An army metal box"
                      data-comment="No way I could open this! The lock looks rusted solid and the whole thing feels like a ton of bricks."
                      onClick={(e) => {
                        playSound(MetalBox);
                        incrementItemClicks("metal-box");
                        const msg = e.currentTarget.getAttribute("data-comment");
                        if (msg) showComment(msg);
                        triggerVibration(30);
                      }}
                    >
                      <div className="cube metal-box item" id="hover-not">
                        <span className="visually-hidden">Dark metal box with black and yellow striped edges</span>
                      </div>
                    </div>
                  </div>
                </div>
  )
};

export default Shelf;