import automata.turing.*;
import java.awt.Point;
import java.io.File;
import java.util.Collections;

/** Test-only oracle using the unmodified bundled JFLAP codec. */
public class BlockCodecFixture {
 public static void main(String[] args) {
  file.XMLCodec codec=new file.XMLCodec();
  if(args[0].equals("check")){
   TuringMachineBuildingBlocks m=(TuringMachineBuildingBlocks)codec.decode(new File(args[1]),Collections.emptyMap());
   TMState a=(TMState)m.getStateWithID(0);
   if(m.getStates().length!=3||a.getInnerTM().getStates().length!=2)throw new AssertionError("Lost nested states");
   if(!a.getInternalName().equals(((TMState)m.getStateWithID(1)).getInternalName()))throw new AssertionError("Lost shared reference");
   TMTransition t=(TMTransition)m.getTransitions()[0];
   if(!t.isBlockTransition()||!t.getWrite(0).equals("~")||!t.getDirection(0).equals("S"))throw new AssertionError("Lost block transition");
   System.out.println("Original Java codec reopened block references and transition flags");return;
  }
  TuringMachineBuildingBlocks inner=new TuringMachineBuildingBlocks(1);
  TMState x=inner.createTMStateWithID(new Point(0,80),0),y=inner.createTMStateWithID(new Point(200,80),1);
  x.setInternalName("EmptyStart");y.setInternalName("EmptyEnd");
  inner.setInitialState(x);inner.addFinalState(y);
  inner.addTransition(new TMTransition(x,y,"a","b","S"));
  TuringMachineBuildingBlocks root=new TuringMachineBuildingBlocks(1);
  TMState a=root.createInnerTM(new Point(0,100),inner,"Rewrite",0),b=root.createInnerTM(new Point(250,100),inner,"Rewrite",1),c=root.createTMStateWithID(new Point(500,100),2);
  a.setName("Rewrite & first");c.setInternalName("EmptyFinal");root.setInitialState(a);root.addFinalState(c);
  TMTransition t=new TMTransition(a,c,"b","~","S");t.setBlockTransition(true);root.addTransition(t);
  codec.encode(root,new File(args[1]),Collections.emptyMap());
 }
}
