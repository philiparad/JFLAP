import java.util.*;
import java.lang.reflect.*;
import pumping.*;

/** Controlled replay of the supplied JFLAP 7.1 regular opponent methods.
 * Only LemmaMath's random source is replaced, by a deterministic fractional source.
 * No original method bodies or model fields are changed.
 */
public class RegularPumpingFixture {
 static final String[] IDS={"AnEven","NaNb","AB2n","ABnAk","AnBn","Palindrome","BBABAnAn","B5W","BkABnBAn","AnBk","AnBkCnk","AnBlAk","B5Wmod"};
 static final double[] FRACTIONS={0,0.49,0.99};
 static Field random;
 static List<String> records=new ArrayList<String>();
 static class FractionRandom extends Random {
  final double fraction;
  FractionRandom(double fraction){this.fraction=fraction;}
  public int nextInt(int bound){return (int)Math.floor(fraction*bound);}
  public boolean nextBoolean(){return fraction<0.5;}
 }
 static void rng(double fraction)throws Exception {random.set(null,new FractionRandom(fraction));}
 static RegularPumpingLemma model(String id)throws Exception{return (RegularPumpingLemma)Class.forName("pumping.reg."+id).newInstance();}
 static String q(String s){if(s==null)return "null";StringBuilder b=new StringBuilder("\"");for(char c:s.toCharArray()){if(c=='\\'||c=='\"')b.append('\\').append(c);else if(c=='\n')b.append("\\n");else if(c=='\r')b.append("\\r");else if(c=='\t')b.append("\\t");else if(c<32)b.append(String.format("\\u%04x",(int)c));else b.append(c);}return b.append('"').toString();}
 static String parts(RegularPumpingLemma p){return "["+q(p.getX())+","+q(p.getY())+","+q(p.getZ())+"]";}
 static String head(String id,String kind,int m,double fraction){return "{\"id\":"+q(id)+",\"kind\":"+q(kind)+",\"m\":"+m+",\"random\":"+fraction;}
 static void split(String id,int m,String word,double fraction)throws Exception{
  RegularPumpingLemma p=model(id);p.setM(m);p.setW(word);rng(fraction);
  String prefix=head(id,"split",m,fraction)+",\"word\":"+q(word)+",\"belongs\":"+p.isInLang(word);
  try{p.chooseDecomposition();records.add(prefix+",\"parts\":"+parts(p)+"}");}
  catch(RuntimeException e){records.add(prefix+",\"error\":"+q(e.getClass().getSimpleName())+"}");}
 }
 public static void main(String[] args)throws Exception{
  random=LemmaMath.class.getDeclaredField("RAND_GENERATOR");random.setAccessible(true);
  for(String id:IDS){
   RegularPumpingLemma initial=model(id);int[] range=initial.getRange();
   records.add("{\"id\":"+q(id)+",\"kind\":\"range\",\"range\":"+Arrays.toString(range)+"}");
   for(double fraction:FRACTIONS){rng(fraction);initial.chooseM();records.add(head(id,"length",0,fraction)+",\"value\":"+initial.getM()+"}");}
   LinkedHashSet<String> custom=new LinkedHashSet<String>();
   for(int m=range[0];m<=range[1];m++)for(double fraction:FRACTIONS){
    RegularPumpingLemma p=model(id);rng(fraction);p.setM(m);String w=p.getW();
    records.add(head(id,"word",m,fraction)+",\"value\":"+q(w)+",\"belongs\":"+p.isInLang(w)+"}");
    if(m==range[0]||m==range[0]+1||m==range[1]){
     for(double choice:FRACTIONS)split(id,m,w,choice);
     // All legal human decompositions for the smallest two lengths, plus
     // representative boundary decompositions at the largest length.
     for(int x=0;x<m;x++)for(int y=1;x+y<=Math.min(m,w.length());y++){
      if(m==range[1]&&x!=0&&x+y!=m)continue;
      for(double choice:FRACTIONS){p.setDecomposition(new int[]{x,y});rng(choice);p.chooseI();records.add(head(id,"exponent",m,choice)+",\"word\":"+q(w)+",\"parts\":"+parts(p)+",\"value\":"+p.getI()+",\"belongs\":"+p.isInLang(p.createPumpedString())+"}");}
     }
    }
   }
   // Accepted short words broaden computer-split branch coverage beyond chooseW.
   int m=range[0];
   for(int len=m;len<=Math.max(7,m);len++){
    if(len>12)break;
    for(int bits=0;bits<(1<<len);bits++){
     StringBuilder word=new StringBuilder();for(int k=0;k<len;k++)word.append((bits&(1<<k))==0?'a':'b');
     String w=word.toString();if(initial.isInLang(w))custom.add(w);
     if(custom.size()>=24)break;
    }
    if(custom.size()>=24)break;
   }
   for(String w:custom)for(double fraction:FRACTIONS)split(id,m,w,fraction);
  }
  System.out.println("{\"jarSha256\":\"a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406\",\"randomPolicy\":\"nextInt(bound)=floor(fraction*bound); nextBoolean=fraction<0.5\",\"records\":[\n"+String.join(",\n",new LinkedHashSet<String>(records))+"\n]}");
 }
}
