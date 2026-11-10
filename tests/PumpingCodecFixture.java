import pumping.*;
import java.io.*;
import java.util.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;

/** Original JFLAP XML codec oracle; no original code is modified. */
public class PumpingCodecFixture {
 static final file.XMLCodec CODEC=new file.XMLCodec();
 static String q(String s){if(s==null)return "null";return "\""+s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\r","\\r")+"\"";}
 static String[] pieces(PumpingLemma p){if(p instanceof RegularPumpingLemma){RegularPumpingLemma r=(RegularPumpingLemma)p;return new String[]{r.getX(),r.getY(),r.getZ()};}ContextFreePumpingLemma c=(ContextFreePumpingLemma)p;return new String[]{c.getU(),c.getV(),c.getX(),c.getY(),c.getZ()};}
 static String summary(PumpingLemma p){StringBuilder b=new StringBuilder("{\"title\":"+q(p.getTitle())+",\"role\":"+q(p.getFirstPlayer())+",\"m\":"+p.getM()+",\"word\":"+q(p.getW())+",\"i\":"+p.getI()+",\"parts\":[");for(String s:pieces(p))b.append(q(s)).append(',');b.setLength(b.length()-1);b.append("],\"attempts\":[");for(String a:p.getAttempts())b.append(q(a)).append(',');if(!p.getAttempts().isEmpty())b.setLength(b.length()-1);b.append("],\"cases\":[");for(Object item:p.getDoneCases()){Case c=(Case)item;b.append("{\"lengths\":").append(Arrays.toString(c.getInput())).append(",\"i\":").append(c.getI()).append("},");}if(!p.getDoneCases().isEmpty())b.setLength(b.length()-1);return b.append("]}").toString();}
 static PumpingLemma read(String path){return (PumpingLemma)CODEC.decode(new File(path),Collections.emptyMap());}
 public static void main(String[] args)throws Exception{
  if(args[0].equals("compare")){String a=summary(read(args[1])),b=summary(read(args[2]));if(!a.equals(b))throw new AssertionError(a+" != "+b);System.out.println("Original codec preserved pumping fields, role, split and attempts");return;}
  if(args[0].equals("inspect")){System.out.println(summary(read(args[1])));return;}
  if(args[0].equals("titles")){
   String[] reg={"AnEven","NaNb","AB2n","ABnAk","AnBn","Palindrome","BBABAnAn","B5W","BkABnBAn","AnBk","AnBkCnk","AnBlAk","B5Wmod"};
   String[] cf={"AnBn","AnBnCn","AkBnCnDj","AnBjAnBj","AiBjCk","NagNbeNc","NaNbNc","WW","WW1WrEquals","WW1WrGrtrThanEq","W1BnW2","W1CW2CW3CW4","W1VVrW2"};
   System.out.println("{");for(String family:new String[]{"reg","cf"})for(String id:family.equals("reg")?reg:cf){PumpingLemma p=(PumpingLemma)Class.forName("pumping."+family+"."+id).newInstance();System.out.println(q(family.equals("cf")&&id.equals("AnBn")?"AnBnCF":id)+":"+q(p.getTitle())+",");}System.out.println("\"_roles\":["+q(PumpingLemma.HUMAN)+","+q(PumpingLemma.COMPUTER)+"]}");return;
  }
  Path directory=Paths.get(args[1]);Files.createDirectories(directory);
  for(boolean cf:new boolean[]{false,true})for(String role:new String[]{PumpingLemma.HUMAN,PumpingLemma.COMPUTER})for(int stage=0;stage<4;stage++){
   PumpingLemma p=cf?new pumping.cf.AnBn():new pumping.reg.AnEven();p.setFirstPlayer(role);
   if(stage>=1){p.setM(4);p.setW(cf?"aaaabbbb":"aaaa");}
   if(stage>=2)p.setDecomposition(cf?new int[]{3,1,0,1}:new int[]{0,2});
   if(stage>=3){if(cf)p.addCase(new int[]{3,1,0,1},2);p.setI(2);p.addAttempt("Won: x & y < sample >");p.addAttempt("Failed: previous attempt");}
   String name=(cf?"cf":"reg")+"-"+role.toLowerCase()+"-"+stage+".jff";File file=directory.resolve(name).toFile();org.w3c.dom.Document doc=(cf?new file.xml.CFPumpingLemmaTransducer():new file.xml.RegPumpingLemmaTransducer()).toDOM(p);
   javax.xml.transform.TransformerFactory.newInstance().newTransformer().transform(new javax.xml.transform.dom.DOMSource(doc),new javax.xml.transform.stream.StreamResult(file));
   System.out.println(name+" "+summary(p));
   try{PumpingLemma reopened=read(file.toString());if(!summary(p).equals(summary(reopened)))throw new AssertionError("Round trip changed "+name);}
   catch(Exception error){System.out.println("ORIGINAL REOPEN FAILURE "+name+" "+error);}
  }
 }
}
